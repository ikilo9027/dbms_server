import { HttpException, Injectable } from '@nestjs/common';
import { Util } from 'src/utils/util';
const request = require('request');

@Injectable()
export class AuthService {
  constructor(private util: Util) { }


  getAuthId(data) {
    // data :{ account, passwd}
    let URI = this.util.createURI()
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/auth.cgi',
        qs: {
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'login',
          account: data.body.user_id,
          passwd: data.body.user_passwd,
          session: 'FileStation',
          format: 'cookie',
        }
      }, function (error, response, body) {

        let result = JSON.parse(body.toString())
        if (result.success) {
          resolve(result)
        } else {
          reject(new HttpException(result, result.error.code))
        }
      });
    });
  }

}
