class Client {
    constructor(_host) {
        this.host = _host;
        this.token = "";
    }
    setToken(token) {
        this.token = token;
    }
    getHost() {
        return this.host;
    }
    get(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: url,
                success: (res) => {
                    resolve(res)
                },
                dataType: 'json'
            });
        })
    }
    post(url, data) {
        console.log(url);
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: this.host + url,
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: (res) => {
                    resolve(res)
                },
                dataType: 'json'
            });
        })
    }
}