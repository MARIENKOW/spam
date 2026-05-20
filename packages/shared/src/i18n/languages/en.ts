import { MessageStructure } from "./ru";
import {
    CHANGE_PASSWORD_OTP_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    AVATAR_CONFIG,
    BLOG_VIDEO_CONFIG,
    BLOG_IMAGE_CONFIG,
    BLOG_TITLE_MIN_LENGTH,
    BLOG_TITLE_MAX_LENGTH,
    BLOG_SUBTITLE_MIN_LENGTH,
    BLOG_SUBTITLE_MAX_LENGTH,
    BLOG_BODY_MIN_LENGTH,
    BLOG_BODY_MAX_LENGTH,
    INVITATION_NOTE_MAX_LENGTH,
} from "../../form/constants";
import { formatBytes } from "../../utils";

export const en: MessageStructure = {
    form: {
        password: {
            min: `minimum ${PASSWORD_MIN_LENGTH} characters`,
            max: `maximum ${PASSWORD_MAX_LENGTH} characters`,
            invalid: `Invalid password`,
            label: `Password`,
        },
        currentPassword: {
            min: `minimum ${PASSWORD_MIN_LENGTH} characters`,
            max: `maximum ${PASSWORD_MAX_LENGTH} characters`,
            invalid: `Invalid password`,
            label: `Current Password`,
        },
        newPassword: {
            min: `minimum ${PASSWORD_MIN_LENGTH} characters`,
            max: `maximum ${PASSWORD_MAX_LENGTH} characters`,
            sameAsCurrent: "New password must be different from current",
            label: `New Password`,
        },
        code: {
            length: `Code must be ${CHANGE_PASSWORD_OTP_LENGTH} digits`,
            digits: "Digits only",
            label: "Verification code",
        },
        file: {
            avatar: {
                tooLarge: `Maximum allowed file size: ${formatBytes(AVATAR_CONFIG.maxFileSizeBytes)}`,
            },
            blogVideo: {
                tooLarge: `Maximum allowed file size: ${formatBytes(BLOG_VIDEO_CONFIG.maxFileSizeBytes)}`,
            },
            blogImage: {
                tooLarge: `Maximum allowed file size: ${formatBytes(BLOG_IMAGE_CONFIG.maxFileSizeBytes)}`,
            },
            unsupportedType: "This format is not supported",
            unreadable: "Failed to read the file",
        },
        email: {
            max: `maximum ${EMAIL_MAX_LENGTH} characters`,
            invalid: `Invalid email format`,
            notFound: `Email not found`,
            unique: `Email must be unique`,
            label: `Email`,
        },
        rePassword: {
            label: `Repeat Password`,
            same: "Passwords do not match",
            min: `minimum ${PASSWORD_MIN_LENGTH} characters`,
            max: `maximum ${PASSWORD_MAX_LENGTH} characters`,
        },
        dropzone: {
            dropActive: "Drop the file",
            dropIdle: "Drag file here or click",
        },
        invitation: {
            note: {
                max: `maximum ${INVITATION_NOTE_MAX_LENGTH} characters`,
            },
        },
        blog: {
            body: {
                min: `minimum ${BLOG_BODY_MIN_LENGTH} characters`,
                max: `maximum ${BLOG_BODY_MAX_LENGTH} characters`,
            },
            title: {
                label: "Title",
                min: `minimum ${BLOG_TITLE_MIN_LENGTH} characters`,
                max: `maximum ${BLOG_TITLE_MAX_LENGTH} characters`,
            },
            subtitle: {
                label: "Subtitle",
                min: `minimum ${BLOG_SUBTITLE_MIN_LENGTH} characters`,
                max: `maximum ${BLOG_SUBTITLE_MAX_LENGTH} characters`,
            },
        },
        optional:`*optional`,
        required: "Required field",
        submit: "Submit",
    },
    pages: {
        main: {
            name: "Home",
        },
        register: {
            name: "Register",
            feedback: {
                success: {
                    registerSuccess: "Registration successful!",
                    mailSend:
                        "Registration successful! Activation link has been sent to your email. Valid for: {time}",
                },
            },
            login: "Already have an account?",
        },
        login: {
            name: "Login",
            feedback: {
                success: {
                    loginSuccess: "Login successful!",
                },
                errors: {
                    notActive: "Account is not activated.",
                    blocked: "Your account has been blocked.",
                    passwordNotFound: `Password not set! Click: "{btn}"`,
                    sendMail: "Account is not activated. Send activation email",
                    expire: "Account is not activated. Activation link expired. Send a new email",
                    alreadySend:
                        "Account is not activated. Activation email already sent. Valid for: {time}",
                },
            },
            register: "Don't have an account?",
        },
        admin: {
            name: "Home",
            blog: {
                create: {
                    name: "Create",
                },
                name: "Blog",
                filter: {
                    short: { all: "All", yes: "Short", no: "Not short", label: "Short" },
                    important: { all: "All", yes: "Important", no: "Not important", label: "Important" },
                    dateFrom: "Date from",
                    dateTo: "Date to",
                },
                actions: {
                    main: "Main blog",
                    setMain: "Set as main",
                    unsetMain: "Remove from main",
                    toggleImportant: "Mark as important",
                    toggleImportantActive: "Remove important mark",
                    toggleShort: "Mark as short",
                    toggleShortActive: "Remove short mark",
                },
                feedback: {
                    update: "Post updated successfully",
                    create: "Post created successfully",
                    delete: "Post deleted successfully",
                    deleteAll: "All posts deleted",
                    setMain: "Blog set as main",
                    unsetMain: "Blog removed from main",
                    setImportant: "Blog marked as important",
                    unsetImportant: "Blog unmarked as important",
                    setShort: "Blog marked as short",
                    unsetShort: "Blog unmarked as short",
                    mediaImage: {
                        notFound: "{count} image(s) not found or already deleted",
                        linkedToBlog: "This image is used in a blog and cannot be deleted",
                        deleteAllSkipped: "{count} image(s) were not deleted — used in blogs",
                        deleteSuccess: "Image deleted",
                        deleteAllSuccess: "All images deleted",
                    },
                    mediaVideo: {
                        notFound: "{count} video(s) not found or already deleted",
                        linkedToBlog: "This video is used in a blog and cannot be deleted",
                        deleteAllSkipped: "{count} video(s) were not deleted — used in blogs",
                        deleteSuccess: "Video deleted",
                        deleteAllSuccess: "All videos deleted",
                    },
                },
            },
            settings: {
                name: "Settings",
                groups: {
                    account: "Account",
                    other: "Other",
                },
                profile: {
                    name: "Profile",
                },
                password: {
                    name: "Password",
                    subtitle: "Email confirmation required",
                },
                sessions: {
                    name: "Sessions",
                },
            },
            admins: {
                name: "Administrators",
                status: {
                    all: "All",
                    active: "Active",
                    blocked: "Blocked",
                },
                filter: {
                    status: "Status",
                    sortBy: "Sort by",
                    createdAt: "Registration date",
                    lastLoginAt: "Login date",
                    lastSeenAt: "Last activity",
                },
                empty: "No administrators yet",
                noteLabel: "Note",
                notePlaceholder: "Role, responsibilities...",
                lastSeen: "Online {time}",
                lastLogin: "Login {time}",
                joined: "Joined {time}",
                noSessions: "No active sessions",
                actions: {
                    block: "Block",
                    unblock: "Unblock",
                    delete: "Delete",
                    sessions: "Sessions",
                    updateNote: "Save note",
                    addNote: "Add note",
                    deleteSession: "End session",
                    deleteAllSessions: "End all sessions",
                },
                feedback: {
                    blocked: "Administrator blocked",
                    unblocked: "Block removed",
                    deleted: "Administrator deleted",
                    noteUpdated: "Note updated",
                    sessionDeleted: "Session ended",
                    allSessionsDeleted: "All sessions ended",
                },
                sessions: {
                    title: "Sessions",
                    empty: "No active sessions",
                    deleteAll: "End all",
                },
            },
            users: {
                name: "Users",
                status: {
                    all: "All",
                    active: "Active",
                    noactive: "Inactive",
                    blocked: "Blocked",
                },
                filter: {
                    status: "Status",
                    sortBy: "Sort by",
                    createdAt: "Registration date",
                    lastLoginAt: "Login date",
                    lastSeenAt: "Last activity",
                },
                empty: "No users yet",
                noteLabel: "Note",
                notePlaceholder: "Notes about user...",
                lastSeen: "Online {time}",
                lastLogin: "Login {time}",
                joined: "Joined {time}",
                noSessions: "No active sessions",
                actions: {
                    block: "Block",
                    activate: "Activate",
                    delete: "Delete",
                    updateNote: "Save note",
                    addNote: "Add note",
                    deleteSession: "End session",
                    deleteAllSessions: "End all sessions",
                },
                feedback: {
                    blocked: "User blocked",
                    activated: "User activated",
                    deleted: "User deleted",
                    noteUpdated: "Note updated",
                    sessionDeleted: "Session ended",
                    allSessionsDeleted: "All sessions ended",
                },
                sessions: {
                    title: "Sessions",
                    empty: "No active sessions",
                    deleteAll: "End all",
                },
            },
            invitation: {
                name: "Invitations",
                register: {
                    title: "Create your account",
                    feedback: {
                        success: "Account created. You can now log in.",
                        expired: "This invitation link has expired.",
                        revoked: "This invitation link has been revoked.",
                    },
                },
                actions: {
                    create: "Create invitation",
                    delete: "Delete",
                    revoke: "Revoke",
                    unrevoke: "Restore",
                    resend: "Resend",
                    updateNote: "Save note",
                    addNote: "Add note",
                },
                status: {
                    all: "All",
                    active: "Active",
                    expired: "Expired",
                    revoked: "Revoked",
                },
                linkCopied: "Link copied",
                linkLabel: "Invitation link",
                noteLabel: "Note",
                notePlaceholder: "E.g. who and why",
                expiresAt: "Expires in {time}",
                expiredAt: "Expired {time}",
                revokedAt: "Revoked {time}",
                empty: "No invitations yet",
                form: {
                    title: "New invitation",
                    email: "Administrator email",
                    note: "Note",
                },
                feedback: {
                    created: "Invitation sent to {email}",
                    deleted: "Invitation deleted",
                    revoked: "Invitation revoked",
                    resent: "Invitation resent to {email}",
                    noteUpdated: "Note updated",
                    alreadyExists: "An invitation for this email already exists",
                    adminAlreadyExists: "An administrator with this email already exists",
                    alreadyRevoked: "Invitation is already revoked",
                    notRevoked: "Invitation is not revoked",
                    isRevoked: "Invitation is revoked and cannot be resent",
                    unrevoked: "Invitation restored",
                },
            },
            login: {
                name: "Login",
                feedback: {
                    success: {
                        loginSuccess: "Login successful!",
                    },
                },
            },
            forgotPassword: {
                changePassword: {
                    name: "Change Password",
                    feedback: {
                        success: {
                            changeSuccess: "Password changed successfully!",
                        },
                        errors: {
                            timeout:
                                "Reset link expired! Please request a new one",
                            notFound: "Invalid link! Please request a new one",
                        },
                    },
                },
                name: "Forgot password?",
                login: "Back to login",
                feedback: {
                    errors: {
                        alreadySent:
                            "Reset email already sent. Valid for: {time}",
                    },
                    success: "Reset email sent. Valid for: {time}",
                },
            },
        },
        activate: {
            feedback: {
                success: {
                    accountActivate: "Account successfully activated.",
                },
                errors: {
                    notValid: "Invalid link!",
                    expired: "Link has expired",
                },
            },
        },
        forgotPassword: {
            changePassword: {
                name: "Change Password",
                feedback: {
                    success: {
                        changeSuccess: "Password changed successfully!",
                    },
                    errors: {
                        timeout: "Reset link expired! Please request a new one",
                        notFound: "Invalid link! Please request a new one",
                    },
                },
            },
            name: "Forgot password?",
            login: "Back to login",
            feedback: {
                errors: {
                    alreadySent: "Reset email already sent. Valid for: {time}",
                },
                success: "Reset email sent. Valid for: {time}",
            },
        },
        profile: {
            name: "My Account",
            settings: {
                name: "Settings",
                groups: {
                    account: "Account",
                    other: "Other",
                },
                profile: {
                    name: "Profile",
                },
                password: {
                    name: "Password",
                    subtitle: "Email confirmation required",
                },
                sessions: {
                    name: "Sessions",
                },
            },
        },
        notFound: {
            name: "404",
        },
    },
    api: {
        ERR_NETWORK: "No network connection. Try again later.",
        FALLBACK_ERR: "Oops! Something went wrong, try again later",
        FORBIDDEN: "Access denied",
        UNAUTHORIZED: "You are not authorized! Please log in",
        NOT_FOUND: "Error 404",
        ABORT_ERROR: "Request aborted",
        auth: "Authentication error. Reload page or log in again",
    },
    feedback: {
        empty: {
            title: "Nothing here yet",
        },
        error: {
            network: {
                title: "Oops!",
                subtitle: "No network connection.",
                reload: "Reload",
            },
            fallback: {
                title: "Oops!",
                subtitle: "Something went wrong",
                reload: "Reload",
            },
            resetToken: {
                title: "Oops!",
                subtitle: "Something went wrong",
            },
            activate: {
                title: "Oops!",
                subtitle: "Something went wrong",
                reload: "Resend email",
            },
            forbidden: {
                title: "Oops!",
                subtitle: "Access denied",
                reload: "Reload",
            },
            auth: {
                title: "Oops!",
                subtitle: "Authentication failed",
                reload: "Retry request",
            },
            unauthorized: {
                title: "Oops!",
                subtitle: "You are not authorized",
                reload: "Retry request",
            },
        },
    },
    features: {
        theme: {
            name: "Theme",
        },
        language: {
            name: "Language",
        },
        logout: {
            name: "Log out",
            error: "Failed to log out. Try again later",
            success: "Successfully logged out",
        },
        logoutErr: {
            name: "Reset session",
            error: "Failed to reset session. Try again later",
            success: "Session reset successfully",
        },
        activate: {
            name: "Send email",
            error: {
                alreadySend: "Activation email already sent. Valid for: {time}",
                alreadyActive: "User is already activated",
                blocked: "Your account has been blocked.",
            },
            success: {
                sendSuccess: "Activation email sent. Valid for: {time}",
            },
        },
        changePassword: {
            success: "Password changed successfully! Please log in again",
            blocked: "Password change blocked. Try again in: {time}",
            step1: "Enter passwords",
            step2: "Confirm via email",
            hint: "Code sent to {email}. Valid for: {time}",
            cancel: "Cancel",
            changeCooldown: "Next password change request available in: {time}",
            resend: {
                name: "Resend",
                cooldown: "Resend in: {time}",
                limit: "Resend attempts exceeded",
            },
            code: {
                invalid: "Invalid code. Attempts left: {count}",
                blocked:
                    "Invalid code. Password change blocked. Try again in: {time}",
            },
        },
        avatar: {
            change: "Change",
            upload: "Upload",
            delete: "Delete",
        },
    },
    mail: {
        resetPassword: {
            title: "Password Reset",
            text: "Password Reset",
            button: "Reset Password",
            expires: "Link valid for: {time}",
        },
        activate: {
            title: "Account Activation",
            text: "Account Activation",
            button: "Activate Account",
            expires: "Link valid for: {time}",
        },
        changePassword: {
            subject: "Password Change",
            title: "Confirm Password Change",
            description: "Enter this code to confirm password change:",
            expires: "Code valid for: {time}",
            ignore: "If you did not request a password change, ignore this email.",
        },
        adminInvitation: {
            subject: "Admin Invitation",
            title: "You've been invited to become an administrator",
            description: "Click the button below to accept the invitation and create your account:",
            button: "Accept Invitation",
            expires: "Link valid for: {time}",
            ignore: "If you did not expect this invitation, please ignore this email.",
        },
    },
    components: {
        sessionList: {
            currentSession: "Current session",
            otherSessions: "Other sessions · {count}",
            thisDevice: "This device",
            revokeSession: "Revoke session",
            revokeSuccess: "Session revoked successfully",
            empty: "No active sessions found",
        },
        confirmDialog: {
            title: "Confirm action",
        },
    },
    common: {
        cancel: "Cancel",
        update: "Update",
        delete: "Delete",
        deleteAll: "Delete all",
        confirm: "Confirm",
        refresh: "Refresh",
        search: "Search",
        filters: "Filters",
        resetFilters: "Reset filters",
        sortNewest: "Newest first",
        sortOldest: "Oldest first",
    },
    uploader: {
        openQueue: "Open upload queue",
        uploading: "Uploading…",
        cancelAll: "Cancel all ({count})",
        queueTitle: "Queue ({count})",
        errorsCount: "{count} errors",
        clear: "clear",
        cancel: "Cancel",
        statusWaiting: "Waiting",
        statusDone: "Done",
        statusError: "Error",
        statusCancelled: "Cancelled",
        summaryUploading: "Uploading {active} of {total}",
        summaryDone: "Done · {done}",
        summaryPartial: "{done} of {total} · {errors} errors",
        summaryProgress: "~{progress}% · {waiting} left in queue",
        summaryOpenHint: "click to open",
    },
    video: {
        uploader: {
            trigger: "Upload video",
            drawerTitle: "Video upload",
            dropActive: "Drop to upload",
            dropIdle: "Drag video here or click",
            multipleFiles: "multiple files",
            uploadSuccess: "{name} uploaded",
        },
        control: {
            add: "Add",
            delete: "Delete",
            deleteConfirm: "Delete video?",
            deleteSuccess: "Video deleted",
            deleteAll: "Delete all",
            deleteAllConfirm: "Delete all videos?",
        },
    },
    image: {
        uploader: {
            trigger: "Upload image",
            drawerTitle: "Image upload",
            dropActive: "Drop to upload",
            dropIdle: "Drag image here or click",
            multipleFiles: "multiple files",
            uploadSuccess: "{name} uploaded",
        },
        control: {
            add: "Add",
            delete: "Delete",
            deleteConfirm: "Delete image?",
            deleteSuccess: "Image deleted",
            deleteAll: "Delete all",
            deleteAllConfirm: "Delete all images?",
        },
    },
};
