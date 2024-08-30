/* eslint-disable no-param-reassign */
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import to from 'await-to-js'
import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import GoogleProvider from 'next-auth/providers/google'

import mongoConnect from '@/utils/store/mongoConnect'

export default NextAuth({
  adapter: MongoDBAdapter(mongoConnect),
  providers: [
    GoogleProvider({
      clientId: process.env.NEXTAUTH_CLIENT_ID || '',
      clientSecret: process.env.NEXTAUTH_CLIENT_SECRET || '',
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || '',
      authorization: { params: { scope: 'openid profile user.Read email' } },
      async profile(profile, tokens) {
        const [err, profilePicture] = await to(
          fetch(`https://graph.microsoft.com/v1.0/me/photos/48x48/$value`, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          })
        )

        const { name }: { name: string } = profile
        const commaIdx = name.indexOf(',')
        const newName =
          commaIdx !== -1
            ? `${name.substring(commaIdx + 2)} ${name.substring(0, commaIdx)}`
            : name

        // Confirm that profile photo was returned
        if (profilePicture && profilePicture.ok) {
          const pictureBuffer = await profilePicture.arrayBuffer()
          const pictureBase64 = Buffer.from(pictureBuffer).toString('base64')
          return {
            id: profile.sub,
            name: newName,
            email: profile.email,
            image: `data:image/jpeg;base64, ${pictureBase64}`,
          }
        }

        return {
          id: profile.sub,
          name: newName,
          email: profile.email,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id
      session.accessToken = token.accessToken
      return session
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
})
