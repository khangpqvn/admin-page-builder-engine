const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const replaceExt = require('replace-ext');

/**
 * @swagger
 * /api/file-management/upload-image:
 *  post:
 *    tags:
 *      - File Management
 *    description: Upload file ảnh lên server
 *    produces:
 *      - multipart/form-data
 *    parameters:
 *      - in: header
 *        name: Api-Version
 *        description: version của api.
 *        schema:
 *          type: string
 *          example: public
 *      - in: formData
 *        name: images
 *        type: file
 *        description: List file to upload
 *        required: true
 *      - in: query
 *        name: width
 *        type: number
 *        description: độ rộng ảnh. Nếu muốn fix độ rộng độ cao ảnh
 *      - in: query
 *        name: height
 *        type: number
 *        description: độ cao ảnh. Nếu muốn fix độ rộng độ cao ảnh
 *      - in: query
 *        name: isToJPG
 *        type: boolean
 *        description: Có giảm dung lượng ảnh không. giảm sẽ convert ảnh về dạng jpg
 *    responses:
 *      200:
 *        description: thành công.
 *      400:
 *        description: không có ảnh nào được upload
 *      500:
 *        description: server errors
 */

module.exports = {
  friendlyName: 'Upload image',
  files: ['images'],
  description: '',


  inputs: {
    images: {
      type: 'ref',
      required: true
    },
    width: {
      type: 'number',
      min: 0
    },
    height: {
      type: 'number',
      min: 0
    },
    isToJPG: {
      type: 'boolean',
      defaultsTo: false
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {
    // let origin = this.req.headers.origin;
    let req = this.req;
    let res = this.res;

    // if (process.env.NODE_ENV === 'production' && origin !== Conf.get('BASE_ADMIN_PAGE_URL') ) {
    //   clearTimeout(inputs.images.timeouts.untilMaxBufferTimer)
    //   clearTimeout(inputs.images.timeouts.untilFirstFileTimer)

    //   return res.forbidden({
    //     message: sails.__('DOMAIN NOT ALLOW!')
    //   });
    // }
    let listFileUploadInfo = FileUpload.formatStreamingForm(_.cloneDeep(inputs.images));
    if (!FileUpload.isAllowFile(listFileUploadInfo, true)) {
      clearTimeout(inputs.images.timeouts.untilMaxBufferTimer)
      clearTimeout(inputs.images.timeouts.untilFirstFileTimer)
      return res.forbidden({
        message: sails.__('File không phải định dạng hình ảnh cho phép!')
      });
    }
    try {
      let w = inputs.width;
      let h = inputs.height;
      let info = await sails.upload(inputs.images);
      if (info.length === 0) {
        return res.badRequest({
          message: sails.__('Không có file được upload!'),
        });
      }


      let filesCreate = [];
      let filesNotCreate = [];

      for (let i = 0; i < info.length; i++) {
        const v = info[i];
        let tmp = {
          fileName: v.filename,
          serverFileName: path.basename(v.fd),
          serverFileDir: 'images',
          size: v.size,
          fileType: v.type,
          status: v.status,
          field: v.field
        }
        if (this.req.user && this.req.user.id) {
          tmp.createdBy = this.req.user.id;
        }
        if (FileUpload.isImage(tmp)) {
          // let tempPromise = sharp(v.fd).resize({ withoutEnlargement: true });
          if ((w && h) || inputs.isToJPG) {
            Object.assign(tmp, {
              serverFileName: replaceExt(tmp.serverFileName, '.jpg'),
              fileName: replaceExt(tmp.fileName, '.jpg'),
              fileType: 'image/jpeg'
            });
            if ((w && h)) {
              await sharp(v.fd)
                .resize(w, h, {
                  withoutEnlargement: false,
                  kernel: sharp.kernel.lanczos2,
                  // interpolator: sharp.interpolator.nohalo
                })
                .jpeg()
                .toFile(path.join(FileUpload.dir[tmp.serverFileDir], tmp.serverFileName));
            } else {
              await sharp(v.fd).jpeg()
                .toFile(path.join(FileUpload.dir[tmp.serverFileDir], tmp.serverFileName));
            }
          } else {
            await FileUpload.moveFile(v.fd, FileUpload.getFilePath(tmp));
          }
          filesCreate.push(tmp);
        } else {
          let notCreate = {
            fileName: tmp.fileName,
            error: 'File không phải định dạng hình ảnh'
          };
          filesNotCreate.push(notCreate);
        }
        try {
          fs.unlinkSync(v.fd);
        } catch (error) {

        }
      }
      let created = await FileUpload.createEach(filesCreate).fetch();

      return exits.success({
        created,
        notCreate: filesNotCreate
      });
    } catch (error) {
      return this.res.serverError({
        message: sails.__('500'),
        error: String(error)
      });
    }

  }
};