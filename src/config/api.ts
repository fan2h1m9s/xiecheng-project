import Taro from '@tarojs/taro'

const getEnvValue = (key: string) => {
	if (typeof process !== 'undefined' && process.env) {
		return process.env[key]
	}
	return undefined
}

const getPlatform = () => {
	try {
		return Taro.getSystemInfoSync().platform || ''
	} catch (error) {
		return ''
	}
}

const primaryBaseUrl = getEnvValue('TARO_APP_API_BASE_URL')
const lanBaseUrl = getEnvValue('TARO_APP_API_BASE_URL_LAN')
const localhostBaseUrl = 'http://127.0.0.1:3000'
const platform = getPlatform()
const isRealDevice = platform !== '' && platform !== 'devtools'

export const API_BASE_URL = primaryBaseUrl || (isRealDevice ? (lanBaseUrl || localhostBaseUrl) : localhostBaseUrl)
