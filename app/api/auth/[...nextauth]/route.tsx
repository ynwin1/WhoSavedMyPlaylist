import NextAuth, {DefaultSession} from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import {JWT} from "next-auth/jwt";

// Scopes
const scopes = [
    "user-read-email",
    "user-read-private",
    "playlist-read-private",
].join(" ");

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
    }
}

interface Token extends JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
}

interface SpotifyTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

const SPOTIFY_AUTH_URL: string = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL: string = 'https://accounts.spotify.com/api/token';

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Missing Spotify API credentials');
}

const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization: {
                url: SPOTIFY_AUTH_URL,
                params: { scope: scopes },
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET as string,
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                return {
                    accessToken: account.accessToken,
                    refreshToken: account.refreshToken,
                    accessTokenExpires: (account.expires_at ?? 0) * 1000,
                }
            }

            // return token if it is not expired
            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            return await refreshAccessToken(token as Token);
        },
        async session({ session, token }) {
            return {
                ...session,
                accessToken: token.accessToken as string
            };
        },
    },
});

async function refreshAccessToken(token: Token): Promise<Token> {
    try {
        const basic = Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64");
        const response = await fetch(SPOTIFY_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basic}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens: SpotifyTokenResponse = await response.json();

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            // fall back to old refresh token in case new one is not provided
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (e) {
        console.error("Error refreshing access token:", e);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export { handler as GET, handler as POST };