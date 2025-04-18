/**
 * `deepPopulate` middleware
 */

import type { Core, Schema } from '@strapi/strapi';
import { contentTypes } from '@strapi/utils';
import pluralize from 'pluralize';

interface Options {
  /**
   * Fields to select when populating relations
   */
  relationalFields?: string[];
}

const { CREATED_BY_ATTRIBUTE, UPDATED_BY_ATTRIBUTE } = contentTypes.constants;

const extractPathSegment = (url: string) => url.match(/\/([^/?]+)(?:\?|$)/)?.[1] || '';

const getDeepPopulate = (uid: string, opts: Options = {}) => {
  // Use strapi.contentTypes to access the model by UID in Strapi v5
  // If this doesn't work, you can fallback to strapi.getModel(uid as any)
  const model = strapi.contentTypes[uid];
  if (!model) {
    throw new Error(`Model not found for UID: ${uid}`);
  }

  const attributes = Object.entries(model.attributes) as Array<[
    string,
    {
      type: string;
      relation?: string;
      component?: string;
      components?: string[];
    }
  ]>;

  return attributes.reduce((acc: any, [attributeName, attribute]) => {
    switch (attribute.type) {
      case 'relation': {
        const isMorphRelation = attribute.relation?.toLowerCase().startsWith('morph');
        if (isMorphRelation) {
          break;
        }

        // Ignore not visible fields other than createdBy and updatedBy
        const isVisible = contentTypes.isVisibleAttribute(model, attributeName);
        const isCreatorField = [CREATED_BY_ATTRIBUTE, UPDATED_BY_ATTRIBUTE].includes(attributeName);

        if (isVisible || isCreatorField) {
          acc[attributeName] = { populate: '*' };
        }

        break;
      }

      case 'media': {
        acc[attributeName] = { populate: '*' };
        break;
      }

      case 'component': {
        const populate = getDeepPopulate(attribute.component!, opts);
        acc[attributeName] = { populate };
        break;
      }

      case 'dynamiczone': {
        // Use fragments to populate the dynamic zone components
        const populatedComponents = (attribute.components || []).reduce(
          (acc: any, componentUID: string) => {
            acc[componentUID] = { populate: getDeepPopulate(componentUID, opts) };

            return acc;
          },
          {}
        );

        acc[attributeName] = { on: populatedComponents };
        break;
      }
      default:
        break;
    }

    return acc;
  }, {});
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    if (
      ctx.request.url.startsWith('/api/') &&
      ctx.request.method === 'GET' &&
      !ctx.query.populate &&
      !ctx.request.url.includes('/api/users') &&
      !ctx.request.url.includes('/api/seo')
    ) {
      strapi.log.info('Using custom Dynamic-Zone population Middleware...');

      const contentType = extractPathSegment(ctx.request.url);
      const singular = pluralize.singular(contentType);
      const uid = `api::${singular}.${singular}`;

      ctx.query.populate = {
        ...getDeepPopulate(uid),
        ...(!ctx.request.url.includes('products') && { localizations: { populate: {} } }),
      };
    }
    await next();
  };
};
