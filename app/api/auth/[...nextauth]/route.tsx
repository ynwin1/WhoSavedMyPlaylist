import NextAuth, { DefaultSession } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

// Scopes
const scopes = [
    "user-read-email",
    "user-read-private",
    "playlist-read-private",
].join(" ");

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id?: string;
            name?: string;
            image?: string;
        } & DefaultSession["user"];
    }
}

interface Token extends JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
    id?: string;
    name?: string;
    image?: string;
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
                // Store user data in the token on first sign-in
                return {
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    accessTokenExpires: (account.expires_at ?? 0) * 1000,
                    id: user.id,
                    name: user.name,
                    image: user.image,
                };
            }

            // Return previous token if access token has not expired
            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            // Access token has expired, refresh it
            return await refreshAccessToken(token as Token);
        },
        async session({ session, token }) {
            // Pass properties from token to session
            return {
                ...session,
                accessToken: token.accessToken as string,
                user: {
                    ...session.user,
                    id: token.id,
                    name: token.name,
                    image: token.image,
                },
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
            ...token, // Preserve user properties from the previous token
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
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