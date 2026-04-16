import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const categoryImagesMap = {
  'Earrings': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=600&fit=crop',
  'Hijabs': 'https://picsum.photos/seed/Hijabs/800/600',
  'Handbags': 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&h=600&fit=crop',
  'Hair Accessories': 'https://picsum.photos/seed/HairAccessories/800/600',
  'Rings': 'https://picsum.photos/seed/Rings/800/600',
  'Bracelets': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop',
  'Combo Offers': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=600&fit=crop',
  'Dresses': 'https://picsum.photos/seed/Dresses/800/600',
  'Tops': 'https://picsum.photos/seed/Tops/800/600',
  'Bottoms': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=600&fit=crop',
  'Outerwear': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
  'Accessories': 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&h=600&fit=crop'
}

const demoProducts = [
  { name: 'Elegant Pearl Drop Earrings', price: 1200, discount_price: 950, stock_quantity: 50, featured: true, trending: true, categoryName: 'Earrings', image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&h=800&fit=crop', desc: 'Beautiful pearl drop earrings, perfect for special occasions.' },
  { name: 'Premium Chiffon Hijab', price: 850, discount_price: 650, stock_quantity: 100, featured: false, trending: true, categoryName: 'Hijabs', image: 'https://picsum.photos/seed/HijabProd/800/800', desc: 'Soft, breathable chiffon hijab in a gorgeous pastel shade.' },
  { name: 'Luxury Leather Tote', price: 4500, discount_price: 3990, stock_quantity: 20, featured: true, trending: false, categoryName: 'Handbags', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop', desc: 'A spacious and stylish leather tote bag for everyday use.' },
  { name: 'Crystal Hair Clip Set', price: 450, discount_price: 350, stock_quantity: 150, featured: false, trending: false, categoryName: 'Hair Accessories', image: 'https://picsum.photos/seed/HairClipProd/800/800', desc: 'Sparkling crystal hair clips to add glamour to your hairstyle.' },
  { name: 'Rose Gold Minimalist Ring', price: 1500, discount_price: 1200, stock_quantity: 35, featured: true, trending: true, categoryName: 'Rings', image: 'https://picsum.photos/seed/RingProd/800/800', desc: 'A beautiful rose gold ring with a minimalist design.' },
  { name: 'Silver Charm Bracelet', price: 2100, discount_price: 1800, stock_quantity: 40, featured: false, trending: true, categoryName: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop', desc: 'Elegant silver charm bracelet with interchangeable charms.' },
  { name: 'Floral Summer Maxi Dress', price: 3200, discount_price: 2800, stock_quantity: 25, featured: true, trending: true, categoryName: 'Dresses', image: 'https://picsum.photos/seed/DressProd/800/800', desc: 'Lightweight floral maxi dress, perfect for summer days out.' },
  { name: 'Silk Blouse Top', price: 1800, discount_price: 1450, stock_quantity: 60, featured: false, trending: false, categoryName: 'Tops', image: 'https://picsum.photos/seed/TopProd/800/800', desc: 'A silky smooth, elegant blouse top with a relaxed fit.' },
  { name: 'High-Waist Denim Jeans', price: 2400, discount_price: 1950, stock_quantity: 80, featured: true, trending: false, categoryName: 'Bottoms', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop', desc: 'Classic high-waist denim jeans with a flattering cut.' },
  { name: 'Classic Trench Coat', price: 5500, discount_price: 4900, stock_quantity: 15, featured: true, trending: true, categoryName: 'Outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop', desc: 'A timeless trench coat that elevates any outfit.' }
]

async function downloadImageAndUpload(url, bucket, path) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    console.log(`Uploading ${path} to bucket ${bucket}...`)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true
      })
      
    if (uploadError) throw uploadError
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicUrlData.publicUrl
  } catch (error) {
    console.error(`Error handling image from ${url}:`, error.message)
    return null
  }
}

async function run() {
  console.log('--- Starting Image and Data Seeding Process ---')
  
  // 1. Fetch categories
  const { data: categories, error: catError } = await supabase.from('categories').select('*')
  if (catError) {
    console.error('Error fetching categories:', catError)
    return
  }
  
  console.log(`Found ${categories.length} categories. Process image updates...`)
  
  const categoryIdMap = {}
  
  // 2. Update category images
  for (const category of categories) {
    categoryIdMap[category.name] = category.id
    
    if (categoryImagesMap[category.name]) {
      const imageUrl = categoryImagesMap[category.name]
      const ext = 'jpg'
      const storagePath = `categories/${category.slug}-${Date.now()}.${ext}`
      
      const publicUrl = await downloadImageAndUpload(imageUrl, 'category-images', storagePath)
      
      if (publicUrl) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ image_url: publicUrl, image_path: storagePath })
          .eq('id', category.id)
          
        if (updateError) {
          console.error(`Failed to update category ${category.name}:`, updateError)
        } else {
          console.log(`Successfully updated category: ${category.name}`)
        }
      }
    }
  }
  
  // 3. Seed new products
  console.log('\n--- Seeding Demo Products ---')
  
  for (const prodData of demoProducts) {
    const categoryId = categoryIdMap[prodData.categoryName]
    
    if (!categoryId) {
      console.warn(`Category '${prodData.categoryName}' not found for product '${prodData.name}'. Skipping.`)
      continue
    }
    
    const slug = prodData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)
    
    // Check if product already exists
    const { data: existingProd } = await supabase.from('products').select('*').eq('slug', slug).single()
    if (existingProd) {
      console.log(`Product '${prodData.name}' already exists. Skipping.`)
      continue
    }
    
    // Insert product
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        name: prodData.name,
        slug: slug,
        description: prodData.desc,
        price: prodData.price,
        discount_price: prodData.discount_price,
        category_id: categoryId,
        stock_quantity: prodData.stock_quantity,
        featured: prodData.featured,
        trending: prodData.trending
      })
      .select()
      .single()
      
    if (insertError) {
      console.error(`Failed to insert product '${prodData.name}':`, insertError)
      continue
    }
    
    console.log(`Inserted product: ${prodData.name}`)
    
    // Handle product image
    const ext = 'jpg'
    const storagePath = `products/${slug}-${Date.now()}.${ext}`
    
    const publicUrl = await downloadImageAndUpload(prodData.image, 'product-images', storagePath)
    
    if (publicUrl) {
      const { error: imgInsertError } = await supabase
        .from('product_images')
        .insert({
          product_id: insertedProduct.id,
          image_url: publicUrl,
          storage_path: storagePath,
          alt_text: prodData.name,
          is_main: true,
          display_order: 0
        })
        
      if (imgInsertError) {
        console.error(`Failed to insert image for product '${prodData.name}':`, imgInsertError)
      } else {
        console.log(`Added main image for product: ${prodData.name}`)
      }
    }
  }
  
  console.log('\n--- Seeding Process Complete ---')
}

run()
