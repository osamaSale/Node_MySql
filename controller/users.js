const connection = require("../connection/mysql");
const cloudinary = require("../connection/cloudinary");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const jwt = require("jsonwebtoken");


// Error
const error422 = (massage) => {
    let data = {
        "status": 422,
        "massage": massage
    };
    return data;
}
// All Users
const getUserList = (req, res) => {
    let sql = `select * from users`;
    connection.query(sql, (err, result) => {
        if (result) {
            if (result.length === 0) {
                let data = { "status": 202, "massage": "No Users Found" }
                res.json(data)
            } else {
                let data = { "status": 200, "massage": "Users List Fetched Successfully", "result": result }
                res.json(data)
            }

        } else {
            res.json({ err: err, "status": 500, "error": "Internal Server Error" })
        }
    });
}

// Get Id User
const getIdUser = (req, res) => {
    let id = req.params.id;
    let sql = `select * from users where id = ${id}`;
    connection.query(sql, (err, result) => {
        if (result) {
            if (result.length === 0) {
                let data = { "status": 202, "massage": "No Users Found" }
                res.json(data)
            } else {
                let data = { "status": 200, "massage": "User Fetched successfully", "result": result }
                res.json(data)
            }

        } else {
            res.json({ err: err, "status": 203, "error": "Internal Server Error" })
        }
    });
}

// Create User
const createUser = async (req, res) => {

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let phone = req.body.phone;
    let authorization = req.body.authorization;
    let fileImage = req.file;
    let cloudinary_id = null;
    if (name === "") {
        res.json(error422('Enter your name'))
    }
    else if (email === "") {
        res.json(error422('Enter your Email'))
    }
    else if (password === "") {
        res.json(error422('Enter your Password'))
    }
    else if (phone === "") {
        res.json(error422('Enter your Phone'))
    }
    else if (authorization === "") {
        res.json(error422('Enter your Authorization'))
    }
    else if (!fileImage) {
        res.json(error422('Enter your Image'))

    } else {
        if (fileImage) {
            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            };
            fileImage = await cloudinary.uploader.upload(req.file.path, options);
            cloudinary_id = fileImage?.original_filename
            image = fileImage?.secure_url;
            fileImage = fileImage?.original_filename + "." + fileImage?.format
        }
        password = bcrypt.hashSync(password, Number("salt"));
        let sql = `INSERT INTO users (name, email ,password, image ,fileImage ,phone ,authorization ,cloudinary_id) 
        VALUES('${name}', '${email}' ,'${password}','${image}', '${fileImage}' ,'${phone}' , '${authorization}' , '${cloudinary_id}')`;
        connection.query(sql, async (err, result) => {
            let data = { name: name, email: email, password: password, image: image, fileImage: fileImage, phone: phone, authorization: authorization }
            if (result) {
                res.json({ "massage": "successfully Create user", "status": 200, "result": data, "fileImage": fileImage })
            }

            if (err) {
                const options = {
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                };
                let deleteImage = await cloudinary.uploader.destroy(fileImage, options);
                let deleteFile = await fs.unlink(`./images/users/${fileImage}`, (err) => {
                    if (err) {
                        return "error"
                    } else {
                        return "Ok"
                    }
                })
                res.json({ "status": 201, "massage": `You have entered invalid email ${data.email}`, "deleteImage": deleteImage, "deleteFile": deleteFile })
            }
        })

    }
}

// Edit User

const editUser = (req, res) => {
    const id = req.params.id;
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let authorization = req.body.authorization;
    let fileImage = req.file;
    let cloudinary_id = null;
    let sql = `select * from users where id='${id}'`;
    connection.query(sql, async (err, result) => {
        if (result) {
            const user = result.find((e) => e.id);
            if (user === undefined) {
                res.json({ "massage": "no user id", "status": 202 })
            } else {
                if (fileImage) {
                    const options = {
                        use_filename: true,
                        unique_filename: false,
                        overwrite: true,
                    };
                    await cloudinary.uploader.destroy(user.cloudinary_id, options);
                    fs.unlink(`./images/users/${user.fileImage}`, (err) => {
                        if (err) {
                            return "error";
                        } else {
                            return "Ok";
                        }
                    })
                    fileImage = await cloudinary.uploader.upload(req.file.path, options);
                    cloudinary_id = fileImage?.original_filename
                    image = fileImage?.secure_url;
                    fileImage = fileImage?.original_filename + "." + fileImage?.format
                } else {
                    image = user.image;
                    fileImage = user.fileImage
                    cloudinary_id = user.cloudinary_id
                }
                let sql = `update users set 
                 name = '${name}',
                 email = '${email}',
                 phone = '${phone}',
                 image = '${image}',
                 fileImage = '${fileImage}',
                 authorization = '${authorization}',
                 cloudinary_id = '${cloudinary_id}'
                 where id = '${id}'`;
                connection.query(sql, (err, result) => {
                    if (err) {
                        res.json({ err: " You have entered invalid  Email" });
                    } else {
                        let data = { name: name, email: email, image: image, fileImage: fileImage, phone: phone, authorization: authorization, cloudinary_id: cloudinary_id }
                        if (result) {
                            res.json({ "massage": "successfully Edit", "status": 200, "result": data })
                        }
                    }
                });
            }
        } else {
            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            };
            let deleteImage = await cloudinary.uploader.destroy(cloudinary_id, options);
            await fs.unlink(`./images/users/${fileImage}`, (err) => {
                if (err) {
                    return "error"
                } else {
                    return "Ok"
                }
            })
            res.json({ "status": 201, "massage": `You have entered invalid email ${data.email}`, "deleteImage": deleteImage })
        }
    })
}

// Delete User
const _deleteUser = (req, res) => {
    const id = req.params.id;
    let sql = `select * from users where id='${id}'`;
    connection.query(sql, async (err, result) => {
        if (err) {
            res.json(err);
        }
        if (result) {
            const user = result.find((e) => e.id);
            if (user === undefined) {
                res.json({ "massage": "no user id", "status": 202 })
            } else {
                const options = {
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                };
                let deleteImage = await cloudinary.uploader.destroy(user.cloudinary_id, options);
                let deleteFile = await fs.unlink(`./images/users/${user.fileImage}`, (err) => {
                    if (err) {
                        return "error"
                    } else {
                        return "Ok"
                    }
                })
                let sql = `delete from users where id='${id}'`;
                connection.query(sql, (err, result) => {
                    if (err) {
                        res.json(err);
                    }

                    if (result) {
                        res.json({ "deleteImage": deleteImage, "deleteFile": deleteFile, "massage": "successfully Delete", "status": 200 });
                    }

                });
            }

        }
    });
};



const search = (req, res) => {
    let name = req.params.name;
    let sql = 'SELECT * FROM users WHERE name LIKE "%' + name + '%" '
    connection.query(sql, (err, result) => {

        if (result) {
            const user = result.filter((e) => e.name.toUpperCase() !== -1)
            if (user.length === 0) {
                res.json({ "massage": "no user name", "status": 202 })
            } else {
                res.json(user)
            }
        }
    });
}

// Login

const login = (req, res) => {
    let email = req.body.email
    let password = req.body.password

    // if is empty Email and Password

    if (email === "") {
        res.json(error422('Enter your Email'))
    }
    else if (password === "") {
        res.json(error422('Enter your Password'))
    } else {
        const sql = `select * from users where email ='${email}' `;
        connection.query(sql, async (err, result) => {
            if (result.length === 0) {
                res.json({ "massage": "You have entered invalid Email", "status": 203 });
            } else {
                const findUser = result.find((u) => u.id);
                if (findUser) {
                    const id = findUser.id;
                    if (await bcrypt.compare(req.body.password, findUser.password)) {
                        const token = jwt.sign({ id }, "jwtSecret", { expiresIn: process.env.TOKEN_EXPIRATION });
                        res.json({ "status": 200, "massage": "successfully Login", "result": result, "token": token });
                    } else {
                        res.json({ "massage": "You have entered invalid Password", "status": 201 });
                    }
                }
            }
            
            if (err) {
                res.json({ err: err })
            }
        })
    }
}

module.exports = {
    getUserList,
    getIdUser,
    createUser,
    _deleteUser,
    editUser,
    login,
    search
}