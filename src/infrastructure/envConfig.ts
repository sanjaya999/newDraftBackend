import dotenv from "dotenv";
import { cleanEnv, host, makeValidator, port, str, testOnly } from "envalid";

dotenv.config();

const jsonArrayValidator = makeValidator<string>((value)=>{
    try{
        const parsed = JSON.parse(value);
        if(!Array.isArray(parsed)){
            throw new Error("CORS_ORIGINS must be a JSON array");
        }
        return value;
    }catch(e){
        throw new Error("CORS_ORIGINS must be a valid JSON array string");
    }
})

export const env = cleanEnv(process.env,{
    NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
    HOST: host({ devDefault: testOnly("localhost") }),
    PORT: port({ devDefault: testOnly(3000) }),
    CORS_ORIGIN: jsonArrayValidator({
    devDefault: testOnly('["http://localhost:8888"]'),
  }),
    DATABASE_URL: str(),
    JWT_ACCESS_SECRET: str(),
    ACCESS_EXPIRES_IN: str({ devDefault: testOnly("5d") }),
    JWT_REFRESH_SECRET : str(),
    REFRESH_EXPIRES_IN : str({devDefault: testOnly("30d")})
})