import { ConsoleLogger, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Util } from 'src/utils/util';
import { SimpleConsoleLogger } from 'typeorm';
import { FileRepository } from './file.repository';
import bufferToDataUrl from "buffer-to-data-url"
import { arrayBuffer } from 'stream/consumers';
var moment = require('moment')
var fs = require('fs');
var FormData = require('form-data');
const request = require('request');
const axios = require('axios')
const Blob = require('node-blob');
const path = require('path');

@Injectable()
export class FilesService {
  // constructor() { }
  constructor(
    @InjectRepository(FileRepository)
    private fileRepository: FileRepository,
    private util: Util,
  ) { }
  // 파일 전체조회 API
  getMainFileList(data) {
    let URI = this.util.createURI()
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/entry.cgi',
        qs: {
          _sid: data.headers.authorization.substr(7),
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'list_share',
        }
      }, function (error, response, body) {
        resolve(JSON.parse(body))
      });
    });
  }


  // 하위폴더 검색
  getSubfolderList(data) {
    let URI = this.util.createURI()
    let that = this
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/entry.cgi',
        qs: {
          _sid: data.headers.authorization.substr(7),
          // _sid: 'KT9Ttiz3qPot2-X6-TGXOqMAqJRtq5lmJmD1Yg71R2cbp4vbJzbz2wwpS7i30cJiyM9JlwG-X_QZNfJmccRMUI',
          api: 'SYNO.FileStation.List',
          version: '2',
          method: 'list',
          additional: '["real_path","size","owner","time,perm","type"]',
          folder_path: data.body.file_path
        }
      }, function (error, response, body) {
        resolve(JSON.parse(body.toString()).data)
      });
    });
  }

  saveFileList(data) {
    let that = this

    data.body.forEach(async (file, i) => {
      await that.fileRepository.insert({
        originalName: file.name,
        filePath: file.path.substr(0, file.path.indexOf(file.name) - 1),
        userId: file.additional.owner.user,
        fileSize: file.additional.size,
        fileType: file.additional.type,
        isdir: file.isdir,
        createdAt: moment().format('YYYY-MM-DD hh:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD hh:mm:ss'),
      });
    });

    return 'success'
  }
  // 파일 색인


  searchFiles(data) {
    let that = this
    return new Promise(async function (resolve, reject) {
      let keyword = data.body.serch_keyword
      let file_list = await that.fileRepository.query(`SELECT * FROM files WHERE originalName LIKE '%${keyword}%'`)
      // console.log('file_list', file_list)
      resolve(file_list)
    })
  }
  async uploadFile(files, body) {
    let duplicate = await this.fileRepository.find({
      originalName: files[0].originalname,
      filePath: body.file_path
    })

    let that = this;
    let URI = this.util.createURI()
    let params = {
      api: 'SYNO.FileStation.Upload',
      method: 'upload',
      version: '2',
      overwrite: 'false',
      create_parents: 'true',
      path: body.file_path
    };

    const form = new FormData()
    for (var label in params) {
      form.append(label, params[label]);
    }
    form.append('file', files[0].buffer, files[0].originalname);

    return new Promise(async function (resolve, reject) {
      if (duplicate.length === 0) {
        axios({
          method: 'post',
          params: params,
          // mode: 'no-cors',
          url: URI + '/webapi/entry.cgi',
          headers: {
            'Content-Type': 'multipart/form-data; boundary=' + form.getBoundary(),
            'Cookie': `id=${body.access_token}`
          },
          data: form,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }).then(async (data) => {
          await that.fileRepository.insert({
            originalName: files[0].originalname,
            filePath: body.file_path,
            userId: body.user_id,
            fileSize: files[0].size,
            fileType: files[0].mimetype,
            isdir: false,
            createdAt: moment().format('YYYY-MM-DD hh:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD hh:mm:ss'),
          });
          resolve(data.data)
        }).catch((e) => {
          console.log('????????????', e)
          reject(new HttpException(e.response, 999))
        })
      } else {
        // reject(new HttpException({
        //   message: `${duplicate[0].originalName} 파일이 존재합니다.`
        // }, 999))
        // duplicate = []
        resolve({ duplicate: duplicate[0].originalName })
      }

    });
  }

  downloadFile(data) {
    let URI = this.util.createURI()
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/entry.cgi',
        encoding: null,
        method: 'GET',
        qs: {
          _sid: data.headers.authorization.substr(7),
          path: data.body.path,
          api: 'SYNO.FileStation.Download',
          version: '2',
          method: 'download',
          mode: '"open"'
        }
      }, function (error, response, body) {
        // console.log("AAAA", )
        // const arraybuffer = new ArrayBuffer(body)
        // const base64 = this.util.base64ArrayBuffer(arraybuffer)
        // console.log("arraybuffer", arraybuffer)
        // console.log('base64-----', base64)
        // const uint8Array = new Uint8Array(body);
        // var hiBase64 = body.toString('base64')
        // console.log("BBBB", hiBase64)
        // let data = {
        //   base64: `data:${response.headers['content-type']};base64,${hiBase64}`,
        //   type: response.headers['content-type']
        // }
        // console.log("CCCC", bufferToDataUrl(response.headers['content-type'], body))
        // resolve(bufferToDataUrl(response.headers['content-type'], body))
        let result = {
          type: response.headers['content-type'],
          buffer: body
        }

        resolve(result)
      })
    })
  }
  // 폴더 생성 API
  createFolder(data) {
    let that = this;
    let URI = this.util.createURI()
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/entry.cgi',
        qs: {
          api: 'SYNO.FileStation.CreateFolder',
          version: '2',
          method: 'create',
          folder_path: data.body.folder_path,
          name: data.body.folder_name,
          _sid: data.headers.authorization.substr(7),
        }
      }, async function (error, response, body) {
        if (JSON.parse(body).success) {
          await that.fileRepository.insert({
            originalName: JSON.parse(body).data.folders[0].name,
            filePath: data.body.folder_path,
            userId: data.body.user_id,
            fileSize: '',
            fileType: 'folder',
            isdir: JSON.parse(body).data.folders[0].isdir,
            createdAt: moment().format('YYYY-MM-DD hh:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD hh:mm:ss'),
          });
          resolve(JSON.parse(body.toString()))
        } else {
          reject(new HttpException(JSON.parse(body), JSON.parse(body).error.code))
        }
      });
    });
  }

  // 파일/폴더 삭제 API
  deleteFile(data) {
    let that = this;
    let URI = this.util.createURI()
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/entry.cgi',
        qs: {
          api: 'SYNO.FileStation.Delete',
          version: '1',
          method: 'delete',
          path: data.body.file_path,
          _sid: data.headers.authorization.substr(7),
        }
      }, function (error, response, body) {
        // let select_data = data.body.type === 'cut' ? data.body.data : data.body.data.files
        data.body.data.forEach(async file => {
          let indexOf = file.path.lastIndexOf("/");

          if (file.isdir) {
            let sub = await that.fileRepository.query(`SELECT filePath,originalName FROM files WHERE filePath LIKE '%${file.path}%'`)
            sub.forEach(async ({ filePath, originalName }) => {
              await that.fileRepository.delete({
                originalName: originalName,
                filePath: filePath
              });
            })
          }
          await that.fileRepository.delete({
            originalName: file.path.substr(indexOf + 1),
            filePath: file.path.substr(0, indexOf)
          });
        });
        resolve(body.toString())
      })
    })
  }

  // 파일/폴더 rename API
  renameFile(data) {
    // data :{ file_path, file_name, sid }
    let that = this
    let URI = this.util.createURI()
    return new Promise(function (resolve, reject) {
      request({
        url: URI + '/webapi/entry.cgi',
        qs: {
          api: 'SYNO.FileStation.Rename',
          version: '2',
          method: 'rename',
          path: data.body.file_path,
          name: data.body.file_name,
          _sid: data.headers.authorization.substr(7),
        }
      }, async function (error, response, body) {
        if (JSON.parse(body).data) {
          let before_data = data.body.file_path
          let after_data = JSON.parse(body).data.files[0]
          let before_name = before_data.substr(before_data.lastIndexOf('/') + 1)
          let before_path = before_data.substr(0, before_data.lastIndexOf('/'))

          if (JSON.parse(body).success) {
            if (data.body.data[0].isdir) {
              let sub = await that.fileRepository.query(`SELECT filePath,originalName FROM files WHERE filePath LIKE '%${data.body.data[0].path}%'`)
              sub.forEach(async ({ filePath, originalName }) => {
                let new_path = filePath.replace(data.body.data[0].name, '') + data.body.file_name
                await that.fileRepository.update({ originalName: originalName, filePath: filePath }, {
                  filePath: new_path,
                  updatedAt: moment().format('YYYY-MM-DD hh:mm:ss'),
                })
              })
            }
            await that.fileRepository.update({ originalName: before_name, filePath: before_path }, {
              originalName: after_data.name,
              updatedAt: moment().format('YYYY-MM-DD hh:mm:ss'),
            })
            resolve(JSON.parse(body))
          } else {
            let errorCode = Number(JSON.parse(body).error.code) > 999 ? 999 : Number(JSON.parse(body).error.code)
            console.log(errorCode, errorCode === 999)
            reject(new HttpException(JSON.parse(body), errorCode))
          }
        } else {
          // console.log(',JSON.parse(body)', JSON.parse(body).error.code)
          reject(new HttpException(JSON.parse(body), JSON.parse(body).error.code))
        }

      })
    })
  }

  async copyMove(data) {
    let that = this
    let URI = this.util.createURI()
    console.log('data---', data.body)
    let duplicate = await this.fileRepository.find({
      originalName: data.body.file.name,
      filePath: data.body.dest_folder_path
    })
    return new Promise(function (resolve, reject) {
      if (duplicate.length === 0) {
        request({
          url: URI + '/webapi/entry.cgi',
          qs: {
            api: 'SYNO.FileStation.CopyMove',
            version: '3',
            method: 'start',
            path: data.body.file.path,
            dest_folder_path: data.body.dest_folder_path,
            _sid: data.headers.authorization.substr(7),
          }
        }, async function (error, response, body) {
          await that.fileRepository.insert({
            originalName: data.body.file.name,
            filePath: data.body.dest_folder_path,
            userId: data.body.user_id,
            fileSize: data.body.file.isdir ? '' : data.body.file.additional.size,
            fileType: data.body.file.isdir ? 'folder' : data.body.file.additional.type,
            isdir: data.body.file.isdir,
            createdAt: moment().format('YYYY-MM-DD hh:mm:ss'),
            updatedAt: new Date(Date.now()).toLocaleDateString(),
          });
          if (data.body.type === 'cut') {
            let sub = await that.fileRepository.query(`SELECT filePath,originalName FROM files WHERE filePath LIKE '%${data.body.file.path}%'`)

            if (data.body.file.isdir) {
              sub.forEach(async ({ filePath, originalName }) => {
                let new_path = data.body.dest_folder_path + filePath.replace(data.body.file.path.replace(`/${data.body.file.name}`, ''), '')
                await that.fileRepository.update({ originalName: originalName, filePath: filePath }, {
                  filePath: new_path,
                  userId: data.body.user_id,
                  updatedAt: moment().format('YYYY-MM-DD hh:mm:ss'),
                })
              })
            }
          } else {
            let sub = await that.fileRepository.query(`SELECT filePath,originalName FROM files WHERE filePath LIKE '%${data.body.file.path}%'`)
            sub.forEach(async ({ filePath, originalName }) => {
              console.log('originalName-----------------------', originalName)
              let new_path = data.body.dest_folder_path + filePath.replace(data.body.file.path.replace(`/${data.body.file.name}`, ''), '')
              await that.fileRepository.insert({
                originalName: originalName,
                filePath: new_path,
                userId: data.body.user_id,
                fileSize: data.body.file.isdir ? '' : data.body.file.additional.size,
                fileType: data.body.file.isdir ? 'folder' : data.body.file.additional.type,
                isdir: data.body.file.isdir,
                createdAt: moment().format('YYYY-MM-DD hh:mm:ss'),
                updatedAt: new Date(Date.now()).toLocaleDateString(),
              });
            })
          }

          resolve(JSON.parse(body))
        })
      } else {
        // reject(new HttpException({
        //   message: `${duplicate[0].originalName} 파일이 존재합니다.`
        // }, 999))
        // duplicate = []
        resolve({ duplicate: duplicate[0].originalName })
      }
    })
  }

}
