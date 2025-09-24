import mongoose from 'mongoose'

export const connectionDB = async () => {
    return await mongoose
        .connect("mongodb+srv://mohamedashrafkebal_db_user:mohamed1234@cluster0.pukr5dh.mongodb.net/")
        .then((res) => console.log('DB connection success'))
        .catch((err) => console.log('DB connection Fail', err))
}



