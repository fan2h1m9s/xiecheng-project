const getEnvValue = (key: string) => {
	if (typeof process !== 'undefined' && process.env) {
		return process.env[key]
	}
	return undefined
}

export const API_BASE_URL = getEnvValue('TARO_APP_API_BASE_URL') || 'http://127.0.0.1:3000'
