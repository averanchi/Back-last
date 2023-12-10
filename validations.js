import { body } from "express-validator";

export const loginValidator = [
  body("email", "Email isn't correct").isEmail(),
  body("password", "Password can't be shorter then 5 symbols").isLength({
    min: 5,
  }),
];

export const registerValidator = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль не может быть короче 5 символов").isLength({
    min: 5,
  }),
  body("fullName", "Укажите имя, не менее 3 символов").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка на аватарку").optional().isString(),
];

export const postCreateValidator = [
  body("title", "Type the article's title")
    .isLength({
      min: 3,
    })
    .isString(),
  body("text", "Type article's text, it must be longer than 10 symbols")
    .isLength({ min: 10 })
    .isString(),
  body("tags", "The tag's format isn't correct (it must be an array)")
    .optional()
    .isArray(),
  body("imageUrl", "The images link isn't correct").optional().isString(),
];
