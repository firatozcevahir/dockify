export const environment = {
  production: true,

  api: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''),

  auth_api: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + '/account',

  stsAuthority: 'https://identity.teknopalas.com.tr',
  tpsIdentityConfig: {
    apiKey: '<your-api-key>',
    secretKey: '<your-secret-key>',
    appId: '<your-app-id>',
  }

};
