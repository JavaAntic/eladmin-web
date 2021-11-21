import request from '@/utils/request'
import {
  encrypt
} from '@/utils/rsaEncrypt'
// 安全报告列表页
export function getdocument(data) {
  console.log(data)
  return request({
    url: 'api/document',
    method: 'get',
    data
  })
}
// 安全报告上传文件
export function getupload(data) {
  const params = {
    name: data.filename,
    file: data.file,
    isModel: false
  }
  return request({
    url: 'api/document',
    method: 'post',
    params
  })
}

export function del(ids) {
  return request({
    url: 'api/users',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/users',
    method: 'post',
    data
  })
}

export function editUser(data) {
  return request({
    url: 'api/users/center',
    method: 'put',
    data
  })
}

export function updatePass(user) {
  const data = {
    oldPass: encrypt(user.oldPass),
    newPass: encrypt(user.newPass)
  }
  return request({
    url: 'api/users/updatePass/',
    method: 'post',
    data
  })
}

export function updateEmail(form) {
  const data = {
    password: encrypt(form.pass),
    email: form.email
  }
  return request({
    url: 'api/users/updateEmail/' + form.code,
    method: 'post',
    data
  })
}

export default {
  getdocument,
  edit,
  del,
  getupload
}
