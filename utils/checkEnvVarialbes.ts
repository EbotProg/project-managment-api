// env check script

export default function checkEnvVarialbles() {
    
    const envVariables: string[] = [
        'NODE_ENV',
        'APP_PORT',
        'DB_USERNAME',
        'DB_PASSWORD',
        'DB_DATABASE',
        'DB_HOST',
        'DB_PORT'
    ]
    for(const key of envVariables) {
        if(!process.env[key]) {
            throw new Error(`Missing env variable value for ${key}`)
        }
    }
}

