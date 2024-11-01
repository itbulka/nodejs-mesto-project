import mongoose from 'mongoose';
import validator = require('validator');

type TUser = {
  name: string,
  about: string,
  avatar: string,
  email: string,
  password: string
}

const userSchema = new mongoose.Schema<TUser>({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 200,
  },
  avatar: {
    type: String,
    required: false,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: function (v: string) {
        if (!v) return true; // Пропускаем валидацию, если поле пустое
        return /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/.test(v);
      },
      message: (props) => `${props.value} is not a valid URL`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

export default mongoose.model<TUser>('user', userSchema);
