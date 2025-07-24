import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'cloudinaryPublicId',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  upload: {
    staticDir: 'media',
    staticURL: '/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' && doc.filename) {
          try {
            const cloudinary = (await import('../lib/cloudinary')).default
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(
              `${process.cwd()}/media/${doc.filename}`,
              {
                public_id: doc.id,
                folder: 'payload-uploads',
              }
            )
            
            // Update document with Cloudinary public ID
            await req.payload.update({
              collection: 'media',
              id: doc.id,
              data: {
                cloudinaryPublicId: result.public_id,
              },
            })
          } catch (error) {
            console.error('Cloudinary upload error:', error)
          }
        }
      },
    ],
  },
}