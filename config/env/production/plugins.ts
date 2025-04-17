export default ({ env }) => ({
  email: {
    config: {
      provider: "amazon-ses",
      providerOptions: {
        key: env("AWS_SES_KEY"),
        secret: env("AWS_SES_SECRET"),
        amazon: env("AWS_SES_URL"),
      },
      settings: {
        defaultFrom: env("AWS_SES_FROM"),
        defaultReplyTo: env("AWS_SES_REPLYTO"),
      },
    },
  },
});
