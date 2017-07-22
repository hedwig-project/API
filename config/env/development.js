'use strict';

/**
 * Expose
 */

const DB_USER = process.env.DB_USER
if(!DB_USER || DB_USER === "") throw new Error('DB_USER must be set as environment variable')

const DB_PASS = process.env.DB_PASS
if(!DB_PASS || DB_PASS === "") throw new Error('DB_PASS must be set as environment variable')

const DB_HOST = process.env.DB_HOST
if(!DB_HOST || DB_HOST === "") throw new Error('DB_HOST must be set as environment variable')
    
const DB_NAME = process.env.DB_NAME
if(!DB_NAME || DB_NAME === "") throw new Error('DB_NAME must be set as environment variable')
    
const API_SECRET = process.env.API_SECRET
if(!API_SECRET || API_SECRET === "") throw new Error('API_SECRET must be set as environment variable')
    
const API_SECRET_ADM = process.env.API_SECRET_ADM
if(!API_SECRET_ADM || API_SECRET_ADM === "") throw new Error('API_SECRET_ADM must be set as environment variable')

module.exports = {
    db: `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}`,
    apiSecret: function () {
        return API_SECRET;
    },
    apiSecretAdmin: function () {
        return API_SECRET_ADM;
    },
    saltRounds: function () {
        return 5;
    }
};