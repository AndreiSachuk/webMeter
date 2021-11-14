const { Router } = require( 'express' )
const bcrypt = require( 'bcryptjs' )
const { check, validationResult } = require( 'express-validator' )
const jwt = require( 'jsonwebtoken' )
const config = require( 'config' )
const User = require( '../models/User' )
const router = Router()

router.post(
    '/register',
    [
        check( 'email', 'Введен некорректный email' ).isEmail(),
        check( 'password', 'Минимальная длина пароля 6 символов' )
            .isLength( { min: 6 } )
    ],
    async ( req, res ) => {
        try {

            const errors = validationResult( req )

            if ( !errors.isEmpty() ) {
                return res.status( 500 ).json( {
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                } )
            }
            const { email, password } = req.body

            const candidate = await User.findOne( { email } )

            if ( candidate ) {
                return res.status( 400 ).json( { message: 'Такой пользователь уже существует' } )
            }

            const hashedPassword = await bcrypt.hash( password, 10 )
            const user = new User( { email, password: hashedPassword } )

            await user.save()
            res.status( 201 ).json( { message: 'Пользователь создан' } )

        } catch (e) {
            res.status( 500 ).json( { message: 'Что-то пошло не так' } )
            throw e
        }
    } )
router.post(
    '/login',
    [
        check( 'email', 'Введен некорректный email' ).isEmail(),
        check( 'password', 'Введите пароль' ).exists()
    ],
    async ( req, res ) => {
        try {
            const errors = validationResult( req )

            if ( !errors.isEmpty() ) {
                return res.status( 500 ).json( {
                    errors: errors.array(),
                    message: 'Некорректные данные при входе в систему'
                } )
            }

            const { email, password } = req.body

            const user = await User.findOne( { email } )

            if ( !user ) {
                return res.status( 400 ).json( { message: 'Пользователь не найден' } )
            }

            const isMatch = await bcrypt.compare( password, user.password )

            if ( !isMatch ) {
                return res.status( 400 ).json( { message: 'Неверный пароль, попробуйте снова' } )
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get( 'jwtSecret' ),
                { expiresIn: '1h' }
            )

            res.json( { token, userId: user.id } )



        } catch (e) {
            res.status( 500 ).json( { message: "Что-то пошло не так" } )
        }
    } )
module.exports = router
