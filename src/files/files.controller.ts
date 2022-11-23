import { Body, Controller, Delete, Get, Patch, Post, Put, Req, Request, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
// import { Request, Response } from 'express';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const mime = require("mime/lite");
const fs = require("fs");
const Blob = require('node-blob');
const File = require('node-file');
var FormData = require('form-data');

// const File = require("file");

@Controller('files')
@ApiTags('File API')
export class FilesController {
  constructor(private filesService: FilesService) { }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '최상위 폴더 조회 API', description: '최상위 폴더 조회.' })
  @ApiResponse({
    status: 201,
    description: 'succeess.',
    schema: {
      example: {
        data: {
          offset: 'Number',
          total: 'Number',
          shares: []
        },
        success: true
      },
    }
  })
  @ApiResponse({
    status: 119,
    description: 'SID not found.',
    schema: {
      example: {
        error: {
          code: 119
        },
        success: false
      },
    }
  })
  @Post('/')
  getAllFileList(@Req() request: Request) {
    return this.filesService.getMainFileList(request);
  }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '하위파일 조회 API', description: '하위파일 조회.' })
  @ApiBody({ schema: { example: { file_path: "상위 폴더명 ex) /file-share" } } })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    schema: {
      example: {
        "statusCode": 500,
        "message": "Internal server error"
      },
    }
  })
  @ApiResponse({
    status: 119,
    description: 'SID not found.',
    schema: {
      example: {
        error: {
          code: 119
        },
        success: false
      },
    }
  })
  @ApiResponse({
    status: 201,
    description: 'succeess.',
    schema: {
      example: {
        data: {
          offset: 'Number',
          total: 'Number',
          "files": [
            {
              "additional": {
                "owner": {
                  "gid": 1001,
                  "group": "",
                  "uid": 1000,
                  "user": ""
                },
                "real_path": "/volume1/file-share/#recycle",
                "size": 2852,
                "type": ""
              },
              "isdir": true,
              "name": "#recycle",
              "path": "/file-share/#recycle"
            },
          ],
          success: true
        },
      }
    }
  })
  @ApiResponse({
    status: 119,
    description: 'SID not found.',
    schema: {
      example: {
        error: {
          code: 119
        },
        success: false
      },
    }
  })
  @Post('/sub_folder')
  getSubFolderList(@Req() request: Request) {
    // console.log(request.body)
    return this.filesService.getSubfolderList(request);
  }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '새폴더 생성 API', description: '새폴더 생성.' })
  @ApiBody({ schema: { example: { folder_path: "생성될 경로 ex) /path", folder_name: "생성될 파일명", user_id: "userId" } } })
  @ApiResponse({
    status: 400,
    description: 'The file name is only a number.',
    schema: {
      example: {
        error: { code: 400 },
        success: false
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'succeess.',
    schema: {
      example: {
        folders: [{ isdir: true, name: "qaqa", path: "/test_dbsm1/qaqa" }],
        isdir: true,
        name: "qaqa",
        path: "/test_dbsm1/qaqa",
        success: true
      }
    }
  })
  @ApiResponse({
    status: 1100,
    description: 'Failed to create a folder. More information in <errors> object.',
    schema: {
      example: {
        error: { code: 1100 },
        success: false
      }
    }
  })
  @ApiResponse({
    status: 1101,
    description: 'The number of folders to the parent folder would exceed the system limitation.',
    schema: {
      example: {
        error: { code: 1101 },
        success: false
      }
    }
  })
  @ApiResponse({
    status: 119,
    description: 'SID not found.',
    schema: {
      example: {
        error: {
          code: 119
        },
        success: false
      },
    }
  })
  @Post('/create_folder')
  createFolder(@Req() request: Request) {
    return this.filesService.createFolder(request);
  }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '파일삭제 API', description: '파일삭제.' })
  @ApiBody({ schema: { example: { data: [{ additional: { owner: {}, id: 2, isdir: true, name: "sss", path: "/test_dbsm1/sss" } }, { additional: { owner: {}, id: 3, isdir: true, name: "sss", path: "/test_dbsm1/sss" } }], file_path: "/test_dbsm1/bb,/test_dbsm1/ssss" } } })
  @ApiResponse({
    status: 201,
    description: 'The file name is only a number.',
    schema: {
      example: {
        success: true
      }
    }
  })
  @ApiResponse({
    status: 119,
    description: 'SID not found.',
    schema: {
      example: {
        error: {
          code: 119
        },
        success: false
      },
    }
  })
  @Delete('/delete')
  deleteFile(@Req() request: Request) {
    return this.filesService.deleteFile(request);
  }


  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '파일이름 수정 API', description: '파일이름 수정.' })
  @ApiBody({ schema: { example: { data: [{ additional: { owner: {}, id: 2, isdir: true, name: "sss", path: "/test_dbsm1/sss" } }], file_name: "변경할 파일명", file_path: "파일 포함 경로" } } })
  @ApiResponse({
    status: 201,
    description: 'success.',
    schema: {
      example: {
        data: { files: [{ isdir: true, name: "aaaaasdd", path: "/test_dbsm1/aaaaasdd" }] },
        success: true
      }
    }
  })
  @Patch('/rename')
  renameFile(@Req() request: Request) {
    return this.filesService.renameFile(request);
  }

  @ApiOperation({ summary: '파일 업로드 API', description: '파일 업로드.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user_id: { type: 'string' },
        file_path: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'success.',
    schema: {
      example: {
        data: { blSkip: false, file: "Screenshot_5.png", pid: 10741, progress: 1 },
        success: true
      }
    }
  })
  @Post('/upload')
  @UseInterceptors(AnyFilesInterceptor())
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    return this.filesService.uploadFile(files, body)
  }

  @Post('/workspaceboards')
  @UseInterceptors(AnyFilesInterceptor())
  uploadFileTest(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body) {
    console.log('-----------------', files, body)
    // return this.filesService.uploadFile(files, body)
  }

  // @Post('/upload')
  // uploadFile(@Req() request: Request) {
  //   console.log("request",request.body)
  //   return "Testing"
  //   // return this.filesService.uploadFile(files, body)
  // }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '파일 다운로드 API', description: '파일 다운로드.' })
  @ApiBody({ schema: { example: { path: "/test_dbsm1/Screenshot_5.png" } } })
  @ApiResponse({
    status: 201,
    description: 'success.',
    schema: {
      example: {
        base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA3I...",
        type: "image/png"
      }
    }
  })
  @Post('/download')
  downloadFile(@Req() request: Request) {
    // console.log('request',request.body)
    return this.filesService.downloadFile(request);
  }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '파일 검색 API', description: '파일 검색.' })
  @ApiBody({ schema: { example: { serch_keyword: "" } } })
  @ApiResponse({
    status: 201,
    description: 'success.',
    schema: {
      example: {
        data: [{ createdAt: "2022-03-29T19:24:46.000Z", filePath: "/test_dbsm1", fileSize: "", fileType: "folder", id: 730, isdir: 1, originalName: "ssss", updatedAt: "2022-03-29T19:55:09.000Z", userId: "설창환" }]
      }
    }
  })
  @Post('/search')
  searchFile(@Req() request: Request) {
    return this.filesService.searchFiles(request);
  }

  @ApiBearerAuth('accesskey')
  @ApiOperation({ summary: '붙여넣기 API', description: '파일 붙여넣기.' })
  @ApiBody({ schema: { example: { dest_folder_path: "/test_dbsm1/ssss", file: { additional: { owner: {} }, isdir: false, id: 5, name: "Screenshot_4.png", path: "/test_dbsm1/Screenshot_4.png" }, type: "cut", user_id: "설창환" } } })
  @ApiResponse({
    status: 201,
    description: 'success.',
    schema: {
      example: {
        data: { taskid: "FileStation_624412379DB5F2A7" },
        success: true
      }
    }
  })
  @Post('/copy_move')
  copyMove(@Req() request: Request) {
    return this.filesService.copyMove(request);
  }

  @Post('/save')
  saveFileList(@Req() request: Request) {
    // console.log('request------------', request.body)
    return this.filesService.saveFileList(request);
  }
}