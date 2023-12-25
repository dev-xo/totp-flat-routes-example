import type { User } from '@prisma/client'

import { Authenticator } from 'remix-auth'
import { TOTPStrategy } from 'remix-auth-totp'

import { authSessionStorage } from '~/modules/auth/auth-session.server.ts'
import { sendAuthEmail } from '~/modules/email/email.server.ts'
import { prisma } from '~/utils/db.server.ts'

export let authenticator = new Authenticator<User>(authSessionStorage, {
  throwOnError: true,
})

/**
 * TOTP - Strategy.
 */
authenticator.use(
  new TOTPStrategy(
    {
      secret: process.env.ENCRYPTION_SECRET,
      magicLinkGeneration: { callbackPath: '/magic-link' },

      createTOTP: async (data, expiresAt) => {
        await prisma.totp.create({ data: { ...data, expiresAt } })

        try {
          // Delete expired TOTP records (Optional).
          await prisma.totp.deleteMany({ where: { expiresAt: { lt: new Date() } } })
        } catch (error) {
          console.warn('Error deleting expired TOTP records', error)
        }
      },
      readTOTP: async (hash) => {
        // Get the TOTP data from the database.
        return await prisma.totp.findUnique({ where: { hash } })
      },
      updateTOTP: async (hash, data, expiresAt) => {
        // Update the TOTP data in the database.
        await prisma.totp.update({ where: { hash }, data })
      },
      sendTOTP: async ({ email, code, magicLink }) => {
        await sendAuthEmail({ email, code, magicLink })
      },
    },
    async ({ email }) => {
      let user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        user = await prisma.user.create({ data: { email } })
        if (!user) throw new Error('Whoops! Unable to create user.')
      }

      return user
    },
  ),
)
