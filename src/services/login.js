import { request, config } from 'utils'

const { api } = config
const { userLogin } = api

export async function login (data) {
  return request({
    formUrlencoded: true,
    url: userLogin,
    method: 'post',
    data,
  })
}
