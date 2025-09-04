import { getIronSession } from "iron-session";

export const sessionOptions = {
    password: process.env.SESSION_SECRET,
    cookieName: "entity_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60,
    },
};

export async function getSession(req, res) {
    return getIronSession(req, res, sessionOptions);
}
