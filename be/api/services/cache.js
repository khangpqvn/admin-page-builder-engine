module.exports = {
    get: async (key) => {
        let ret = await sails.helpers.cache.get(key);
        return ret;
    }
}