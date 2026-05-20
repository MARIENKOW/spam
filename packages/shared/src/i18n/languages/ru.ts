import {
    EMAIL_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    CHANGE_PASSWORD_OTP_LENGTH,
    AVATAR_CONFIG,
    BLOG_VIDEO_CONFIG,
    BLOG_IMAGE_CONFIG,
    BLOG_TITLE_MIN_LENGTH,
    BLOG_TITLE_MAX_LENGTH,
    BLOG_SUBTITLE_MAX_LENGTH,
    BLOG_SUBTITLE_MIN_LENGTH,
    BLOG_BODY_MAX_LENGTH,
    BLOG_BODY_MIN_LENGTH,
    INVITATION_NOTE_MAX_LENGTH,
} from "../../form/constants";
import { formatBytes } from "../../utils";

export const ru = {
    form: {
        password: {
            min: `минимум ${PASSWORD_MIN_LENGTH} символов`,
            max: `максимум ${PASSWORD_MAX_LENGTH} символов`,
            invalid: `Неправильный пароль`,
            label: `Пароль`,
        },
        currentPassword: {
            min: `минимум ${PASSWORD_MIN_LENGTH} символов`,
            max: `максимум ${PASSWORD_MAX_LENGTH} символов`,
            invalid: `Неправильный пароль`,
            label: `Текущий Пароль`,
        },
        newPassword: {
            min: `минимум ${PASSWORD_MIN_LENGTH} символов`,
            max: `максимум ${PASSWORD_MAX_LENGTH} символов`,
            sameAsCurrent: "Новый пароль совпадает с текущим",
            label: `Новый пароль`,
        },
        code: {
            length: `Код должен содержать ${CHANGE_PASSWORD_OTP_LENGTH} цифр`,
            digits: "Только цифры",
            label: "Код подтверждения",
        },
        file: {
            avatar: {
                tooLarge: `Максимально допустимый размер файла: ${formatBytes(AVATAR_CONFIG.maxFileSizeBytes)}`,
            },
            blogVideo: {
                tooLarge: `Максимально допустимый размер файла: ${formatBytes(BLOG_VIDEO_CONFIG.maxFileSizeBytes)}`,
            },
            blogImage: {
                tooLarge: `Максимально допустимый размер файла: ${formatBytes(BLOG_IMAGE_CONFIG.maxFileSizeBytes)}`,
            },
            unsupportedType: "Данный формат не поддерживается",
            unreadable: "Не удалось прочитать файл",
        },
        email: {
            max: `максимум ${EMAIL_MAX_LENGTH} символов`,
            invalid: `некорректный формат почты`,
            notFound: `почта не найдена`,
            unique: `email должен быть уникальным`,
            label: `Почта`,
        },
        rePassword: {
            label: `Пароль повторно`,
            same: "Пароли не совпадают",
            min: `минимум ${PASSWORD_MIN_LENGTH} символов`,
            max: `максимум ${PASSWORD_MAX_LENGTH} символов`,
        },
        dropzone: {
            dropActive: "Отпустите файл",
            dropIdle: "Перетащите файл или нажмите",
        },
        invitation: {
            note: {
                max: `максимум ${INVITATION_NOTE_MAX_LENGTH} символов`,
            },
        },
        blog: {
            body: {
                min: `минимум ${BLOG_BODY_MIN_LENGTH} символов`,
                max: `максимум ${BLOG_BODY_MAX_LENGTH} символов`,
            },
            title: {
                label: "Заголовок",
                min: `минимум ${BLOG_TITLE_MIN_LENGTH} символов`,
                max: `максимум ${BLOG_TITLE_MAX_LENGTH} символов`,
            },
            subtitle: {
                label: "Подзаголовок",
                min: `минимум ${BLOG_SUBTITLE_MIN_LENGTH} символов`,
                max: `максимум ${BLOG_SUBTITLE_MAX_LENGTH} символов`,
            },
        },
        optional: `*необязательное поле`,
        required: "обязательное поле",
        submit: "Подтвердить",
    },
    pages: {
        main: {
            name: "Главная",
        },
        register: {
            name: "Регистрация",
            feedback: {
                success: {
                    registerSuccess: "Регистрация успешна!",
                    mailSend:
                        "Регистрация успешна!. Ссылка для активации была отправлена на почту. Время действия: {time}",
                },
            },
            login: "Уже есть аккаунт?",
        },
        login: {
            name: "Вход",
            feedback: {
                success: {
                    loginSuccess: "Авторизация успешна!",
                },
                errors: {
                    notActive: "Аккаунт не активирован.",
                    blocked: "Ваш аккаунт заблокирован.",
                    passwordNotFound: `Пароль не задано! Нажмите: "{btn}"`,
                    sendMail:
                        "Аккаунт не активирован. Отправьте письмо для активации",
                    expire: "Аккаунт не активирован. Время действия ссылки активации истекло. Отправьте новое письмо",
                    alreadySend:
                        "Аккаунт не активирован. Письмо для активации было отправлено на почту. Время действия: {time}",
                },
            },
            register: "Нет аккаунта?",
        },
        admin: {
            name: "Главная",
            blog: {
                create: {
                    name: "Создать",
                },
                name: "Блог",
                filter: {
                    short: {
                        all: "Все",
                        yes: "Короткие",
                        no: "Не короткие",
                        label: "Короткие",
                    },
                    important: {
                        all: "Все",
                        yes: "Важные",
                        no: "Не важные",
                        label: "Важные",
                    },
                    dateFrom: "Дата от",
                    dateTo: "Дата до",
                },
                actions: {
                    main: "Главный блог",
                    setMain: "Сделать главной",
                    unsetMain: "Снять с главной",
                    toggleImportant: "Отметить как важную",
                    toggleImportantActive: "Снять отметку «важная»",
                    toggleShort: "Отметить как короткую",
                    toggleShortActive: "Снять отметку «короткая»",
                },
                feedback: {
                    create: "Запись успешно создана",
                    update: "Запись успешно обновлена",
                    delete: "Запись успешно удалена",
                    deleteAll: "Все записи удалены",
                    setMain: "Блог назначен главным",
                    unsetMain: "Блог снят с главной",
                    setImportant: "Блог отмечен как важный",
                    unsetImportant: "Блог снят с важных",
                    setShort: "Блог помечен как короткий",
                    unsetShort: "Блог снят с коротких",
                    mediaImage: {
                        notFound:
                            "{count} изображений не найдено или уже удалены",
                        linkedToBlog:
                            "Изображение используется в блоге и не может быть удалено",
                        deleteAllSkipped:
                            "{count} изображений не удалено — используются в блогах",
                        deleteSuccess: "Изображение удалено",
                        deleteAllSuccess: "Все изображения удалены",
                    },
                    mediaVideo: {
                        notFound: "{count} видео не найдено или уже удалены",
                        linkedToBlog:
                            "Видео используется в блоге и не может быть удалено",
                        deleteAllSkipped:
                            "{count} видео не удалено — используются в блогах",
                        deleteSuccess: "Видео удалено",
                        deleteAllSuccess: "Все видео удалены",
                    },
                },
            },
            settings: {
                name: "Настройки",
                groups: {
                    account: "Аккаунт",
                    other: "Прочее",
                },
                profile: {
                    name: "Профиль",
                },
                password: {
                    name: "Пароль",
                    subtitle: "Потребуется подтверждение по email",
                },
                sessions: {
                    name: "Сессии",
                },
            },
            admins: {
                name: "Администраторы",
                status: {
                    all: "Все",
                    active: "Активирован",
                    blocked: "Заблокирован",
                },
                filter: {
                    status: "Статус",
                    sortBy: "Сортировка по",
                    createdAt: "Дата регистрации",
                    lastLoginAt: "Дата входа",
                    lastSeenAt: "Последняя активность",
                },
                empty: "Администраторов пока нет",
                noteLabel: "Заметка",
                notePlaceholder: "Информация о роли, задачах...",
                lastSeen: "Онлайн {time}",
                lastLogin: "Вход {time}",
                joined: "Зарегистрирован {time}",
                noSessions: "Нет активных сессий",
                actions: {
                    block: "Заблокировать",
                    unblock: "Разблокировать",
                    delete: "Удалить",
                    sessions: "Сессии",
                    updateNote: "Сохранить заметку",
                    addNote: "Добавить заметку",
                    deleteSession: "Завершить сессию",
                    deleteAllSessions: "Завершить все сессии",
                },
                feedback: {
                    blocked: "Администратор заблокирован",
                    unblocked: "Блокировка снята",
                    deleted: "Администратор удалён",
                    noteUpdated: "Заметка обновлена",
                    sessionDeleted: "Сессия завершена",
                    allSessionsDeleted: "Все сессии завершены",
                },
                sessions: {
                    title: "Сессии",
                    empty: "Активных сессий нет",
                    deleteAll: "Завершить все",
                },
            },
            users: {
                name: "Пользователи",
                status: {
                    all: "Все",
                    active: "Активирован",
                    noactive: "Не активирован",
                    blocked: "Заблокирован",
                },
                filter: {
                    status: "Статус",
                    sortBy: "Сортировка по",
                    createdAt: "Дата регистрации",
                    lastLoginAt: "Дата входа",
                    lastSeenAt: "Последняя активность",
                },
                empty: "Пользователей пока нет",
                noteLabel: "Заметка",
                notePlaceholder: "Заметки о пользователе...",
                lastSeen: "Онлайн {time}",
                lastLogin: "Вход {time}",
                joined: "Зарегистрирован {time}",
                noSessions: "Нет активных сессий",
                actions: {
                    block: "Заблокировать",
                    activate: "Активировать",
                    delete: "Удалить",
                    updateNote: "Сохранить заметку",
                    addNote: "Добавить заметку",
                    deleteSession: "Завершить сессию",
                    deleteAllSessions: "Завершить все сессии",
                },
                feedback: {
                    blocked: "Пользователь заблокирован",
                    activated: "Пользователь активирован",
                    deleted: "Пользователь удалён",
                    noteUpdated: "Заметка обновлена",
                    sessionDeleted: "Сессия завершена",
                    allSessionsDeleted: "Все сессии завершены",
                },
                sessions: {
                    title: "Сессии",
                    empty: "Активных сессий нет",
                    deleteAll: "Завершить все",
                },
            },
            invitation: {
                name: "Приглашения",
                register: {
                    title: "Создание аккаунта",
                    feedback: {
                        success: "Аккаунт создан. Можете войти.",
                        expired: "Ссылка приглашения истекла.",
                        revoked: "Ссылка приглашения была отозвана.",
                    },
                },
                actions: {
                    create: "Создать приглашение",
                    delete: "Удалить",
                    revoke: "Отозвать",
                    unrevoke: "Восстановить",
                    resend: "Отправить повторно",
                    updateNote: "Сохранить заметку",
                    addNote: "Добавить заметку",
                },
                status: {
                    all: "Все",
                    active: "Активно",
                    expired: "Истекло",
                    revoked: "Отозвано",
                },
                linkCopied: "Ссылка скопирована",
                linkLabel: "Ссылка приглашения",
                noteLabel: "Заметка",
                notePlaceholder: "Например, кому и зачем выдано",
                expiresAt: "Истекает через {time}",
                expiredAt: "Истекло {time}",
                revokedAt: "Отозвано {time}",
                empty: "Приглашений пока нет",
                form: {
                    title: "Новое приглашение",
                    email: "Email администратора",
                    note: "Заметка",
                },
                feedback: {
                    created: "Приглашение отправлено на {email}",
                    deleted: "Приглашение удалено",
                    revoked: "Приглашение отозвано",
                    resent: "Приглашение повторно отправлено на {email}",
                    noteUpdated: "Заметка обновлена",
                    alreadyExists: "Приглашение для этого email уже существует",
                    adminAlreadyExists:
                        "Администратор с таким email уже существует",
                    alreadyRevoked: "Приглашение уже отозвано",
                    notRevoked: "Приглашение не отозвано",
                    isRevoked:
                        "Приглашение отозвано и не может быть отправлено повторно",
                    unrevoked: "Приглашение восстановлено",
                },
            },
            login: {
                name: "Вход",
                feedback: {
                    success: {
                        loginSuccess: "Авторизация успешна!",
                    },
                },
            },
            forgotPassword: {
                changePassword: {
                    name: "Смена пароля",
                    feedback: {
                        success: {
                            changeSuccess: "Смена пароля успешна!",
                        },
                        errors: {
                            timeout:
                                "Закончился срок действия ссылки восстановления! пройдите еще раз процедуру отправки",
                            notFound:
                                "Ссылка недействительна! пройдите еще раз процедуру отправки",
                        },
                    },
                },
                name: "Забыли пароль?",
                login: "Вернуться ко входу",
                feedback: {
                    errors: {
                        alreadySent:
                            "Письмо с ссылкой на восстановление уже было отправлено. Время действия ссылки: {time}",
                    },
                    success:
                        "Письмо с ссылкой на восстановление отправлено. Время действия ссылки: {time}",
                },
            },
        },

        activate: {
            feedback: {
                success: {
                    accountActivate: "Аккаунт успешно активирован.",
                },
                errors: {
                    notValid: "Ссылка недействительна!",
                    expired: "Вышло время действия ссылки",
                },
            },
        },
        forgotPassword: {
            changePassword: {
                name: "Смена пароля",
                feedback: {
                    success: {
                        changeSuccess: "Смена пароля успешна!",
                    },
                    errors: {
                        timeout:
                            "Закончился срок действия ссылки восстановления! пройдите еще раз процедуру отправки",
                        notFound:
                            "Ссылка недействительна! пройдите еще раз процедуру отправки",
                    },
                },
            },
            name: "Забыли пароль?",
            login: "Вернуться ко входу",
            feedback: {
                errors: {
                    alreadySent:
                        "Письмо с ссылкой на восстановление уже было отправлено. Время действия ссылки: {time}",
                },
                success:
                    "Письмо с ссылкой на восстановление отправлено. Время действия ссылки: {time}",
            },
        },
        profile: {
            name: "Мой аккаунт",
            settings: {
                name: "Настройки",
                groups: {
                    account: "Аккаунт",
                    other: "Прочее",
                },
                profile: {
                    name: "Профиль",
                },
                password: {
                    name: "Пароль",
                    subtitle: "Потребуется подтверждение по email",
                },
                sessions: {
                    name: "Сессии",
                },
            },
        },
        notFound: {
            name: "404",
        },
    },
    api: {
        ERR_NETWORK: "Нет подключения к сети. Попробуйте позже.",
        FALLBACK_ERR: "Упс! Что-то пошло не так, попробуйте позже",
        FORBIDDEN: "Недостаточно прав",
        UNAUTHORIZED: "Вы не авторизованы! войдите в аккаунт",
        NOT_FOUND: "Ошибка 404",
        ABORT_ERROR: "Запрос отменено",
        auth: "Ошибка аутентификации, перезагрузите страницу или войдите заново в аккаунт",
    },
    feedback: {
        empty: {
            title: "Тут пока что пусто",
        },
        error: {
            network: {
                title: "Упс!",
                subtitle: "Нет подключения к сети.",
                reload: "перезагрузить",
            },
            fallback: {
                title: "Упс!",
                subtitle: "Что-то пошло не так",
                reload: "перезагрузить",
            },
            resetToken: {
                title: "Упс!",
                subtitle: "Что-то пошло не так",
            },
            activate: {
                title: "Упс!",
                subtitle: "Что-то пошло не так",
                reload: "отправить письмо",
            },
            forbidden: {
                title: "Упс!",
                subtitle: "Недостаточно прав",
                reload: "перезагрузить",
            },
            auth: {
                title: "Упс!",
                subtitle: "Не удалось провести аутентификацию",
                reload: "Запросить данные заново",
            },
            unauthorized: {
                title: "Упс!",
                subtitle: "вы не авторизованы",
                reload: "Запросить данные заново",
            },
        },
    },
    features: {
        theme: {
            name: "Тема",
        },
        language: {
            name: "Язык",
        },
        logout: {
            name: "Выйти",
            error: "Не удалось выйти с аккаунта! Попробуйте позже",
            success: "Вы удачно вышли с аккаунта",
        },
        logoutErr: {
            name: "Сбросить сессию",
            error: "Не удалось сбросить сессию! Попробуйте позже",
            success: "Вы удачно сбросили сессию",
        },
        activate: {
            name: "Отправить письмо",
            error: {
                alreadySend:
                    "Письмо с ссылкой уже было отправлено на почту. Время действия ссылки: {time}",
                alreadyActive: "Пользователь уже активирован",
                blocked: "Ваш аккаунт заблокирован.",
            },
            success: {
                sendSuccess:
                    "Письмо с ссылкой было отправлено на почту. Время действия ссылки: {time}",
            },
        },
        changePassword: {
            success: "Вы удачно поменяли пароль! Авторизуйтесь заново",
            blocked: "Смена пароля запрещена. Повторите через: {time}",
            step1: "Введите пароли",
            step2: "Подтвердите по email",
            hint: "Код отправлен на {email}. Время действия кода: {time}",
            cancel: "Отменить",
            changeCooldown:
                "Следующий запрос смены пароля доступен через: {time}",
            resend: {
                name: "Повторно",
                cooldown: "Повторно через: {time}",
                limit: "Исчерпаны попытки повторной отправки кода",
            },
            code: {
                invalid: "Неверный код. Осталось попыток: {count}",
                blocked:
                    "Неверный код. Смена пароля запрещена. Повторите через: {time}",
            },
        },
        avatar: {
            change: "Изменить",
            upload: "Добавить",
            delete: "Удалить",
        },
    },

    mail: {
        resetPassword: {
            title: "Восстановление пароля",
            text: "Восстановление пароля",
            button: "Восстановить пароль",
            expires: "Время действия ссылки: {time}",
        },
        activate: {
            title: "Активация аккаунта",
            text: "Активация аккаунта",
            button: "Активировать аккаунт",
            expires: "Время действия ссылки: {time}",
        },
        changePassword: {
            subject: "Смена пароля",
            title: "Подтверждение смены пароля",
            description: "Введите этот код для подтверждения смены пароля:",
            expires: "Код действителен: {time}",
            ignore: "Если вы не запрашивали смену пароля — проигнорируйте это письмо.",
        },
        adminInvitation: {
            subject: "Приглашение администратора",
            title: "Вас приглашают стать администратором",
            description:
                "Нажмите на кнопку ниже, чтобы принять приглашение и создать учётную запись:",
            button: "Принять приглашение",
            expires: "Ссылка действительна: {time}",
            ignore: "Если вы не ожидали этого приглашения — проигнорируйте это письмо.",
        },
    },
    components: {
        sessionList: {
            currentSession: "Текущая сессия",
            otherSessions: "Другие сессии · {count}",
            thisDevice: "Это устройство",
            revokeSession: "Завершить сессию",
            revokeSuccess: "Сессия удачно завершена",
            empty: "Активных сессий не найдено",
        },
        confirmDialog: {
            title: "Подтвердите действие",
        },
    },
    common: {
        cancel: "Отменить",
        update: "Редактировать",
        delete: "Удалить",
        deleteAll: "Удалить все",
        confirm: "Подтвердить",
        refresh: "Обновить",
        search: "Поиск",
        filters: "Фильтры",
        resetFilters: "Сбросить фильтры",
        sortNewest: "Сначала новые",
        sortOldest: "Сначала старые",
    },
    uploader: {
        openQueue: "Открыть очередь загрузки",
        uploading: "Загрузка…",
        cancelAll: "Отменить все ({count})",
        queueTitle: "Очередь ({count})",
        errorsCount: "{count} ошибок",
        clear: "очистить",
        cancel: "Отменить",
        statusWaiting: "В очереди",
        statusDone: "Готово",
        statusError: "Ошибка",
        statusCancelled: "Отменено",
        summaryUploading: "Загружается {active} из {total}",
        summaryDone: "Готово · {done}",
        summaryPartial: "{done} из {total} · {errors} ошибок",
        summaryProgress: "~{progress}% · осталось {waiting} в очереди",
        summaryOpenHint: "нажмите, чтобы открыть",
    },
    video: {
        uploader: {
            trigger: "Загрузить видео",
            drawerTitle: "Загрузка видео",
            dropActive: "Отпустите для загрузки",
            dropIdle: "Перетащите видео или нажмите",
            multipleFiles: "несколько файлов",
            uploadSuccess: "{name} загружено",
        },
        control: {
            add: "Вставить",
            delete: "Удалить",
            deleteConfirm: "Удалить видео?",
            deleteSuccess: "Видео удалено",
            deleteAll: "Удалить все",
            deleteAllConfirm: "Удалить все видео?",
        },
    },
    image: {
        uploader: {
            trigger: "Загрузить изображение",
            drawerTitle: "Загрузка изображений",
            dropActive: "Отпустите для загрузки",
            dropIdle: "Перетащите изображение или нажмите",
            multipleFiles: "несколько файлов",
            uploadSuccess: "{name} загружено",
        },
        control: {
            add: "Вставить",
            delete: "Удалить",
            deleteConfirm: "Удалить изображение?",
            deleteSuccess: "Изображение удалено",
            deleteAll: "Удалить все",
            deleteAllConfirm: "Удалить все изображения?",
        },
    },
};

export type MessageStructure = typeof ru;
