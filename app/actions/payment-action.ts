'use server'

import { revalidatePath } from 'next/cache'

// This is a mock function to simulate payment processing
export async function processPayment(amount: number, currency: string, description: string) {
  // In a real application, this would interact with a payment gateway API
  console.log(`Processing payment of ${amount} ${currency} for ${description}`)

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Simulate successful payment (80% success rate)
  const isSuccessful = Math.random() < 0.8

  if (isSuccessful) {
    console.log('Payment successful')
    return { success: true, transactionId: `mock-${Date.now()}` }
  } else {
    console.log('Payment failed')
    throw new Error('Payment processing failed')
  }
}