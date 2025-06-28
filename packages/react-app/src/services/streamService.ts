import { ethers, BigNumber } from 'ethers'
import { Stream, StreamConfig, StreamStatus } from '../types'
import { streamConfigSchema } from '../utils/validation'
import { handleAsyncError, AppError } from '../utils/validation'

export class StreamService {
  constructor(
    private sablierContract: ethers.Contract,
    private library: ethers.providers.Web3Provider
  ) {}

  validateStreamConfig = (config: StreamConfig): void => {
    const result = streamConfigSchema.safeParse(config)
    if (!result.success) {
      throw new AppError(
        `Invalid stream configuration: ${result.error.issues.map(i => i.message).join(', ')}`,
        'VALIDATION_ERROR'
      )
    }
  }

  createStream = handleAsyncError(async (config: StreamConfig): Promise<string> => {
    this.validateStreamConfig(config)

    const { recipient, amount, tokenAddress, startTime, stopTime } = config
    
    const convertedStart = Math.round(startTime.getTime() / 1000)
    const convertedStop = Math.round(stopTime.getTime() / 1000)
    const convertedDeposit = ethers.utils.parseEther(amount)
    
    // Calculate remainder to ensure exact division
    const duration = convertedStop - convertedStart
    const remainder = convertedDeposit.mod(duration)
    const adjustedDeposit = convertedDeposit.sub(remainder)

    if (adjustedDeposit.lte(0)) {
      throw new AppError('Deposit amount too small for the specified duration', 'INVALID_AMOUNT')
    }

    try {
      const estimatedGas = await this.sablierContract.estimateGas.createStream(
        recipient,
        adjustedDeposit,
        tokenAddress,
        convertedStart,
        convertedStop
      )

      const gasLimit = estimatedGas.mul(120).div(100) // 20% buffer

      const tx = await this.sablierContract.createStream(
        recipient,
        adjustedDeposit,
        tokenAddress,
        convertedStart,
        convertedStop,
        { gasLimit }
      )

      const receipt = await tx.wait()
      
      // Extract stream ID from logs
      const streamCreatedEvent = receipt.events?.find(
        (event: any) => event.event === 'CreateStream'
      )
      
      if (!streamCreatedEvent) {
        throw new AppError('Stream creation event not found', 'EVENT_NOT_FOUND')
      }

      return streamCreatedEvent.args.streamId.toString()
    } catch (error: any) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new AppError('Insufficient funds for transaction', 'INSUFFICIENT_FUNDS')
      }
      if (error.code === 'USER_REJECTED') {
        throw new AppError('Transaction rejected by user', 'USER_REJECTED')
      }
      throw new AppError(`Failed to create stream: ${error.message}`, 'STREAM_CREATION_FAILED')
    }
  })

  getStream = handleAsyncError(async (streamId: string): Promise<Stream | null> => {
    try {
      const streamData = await this.sablierContract.getStream(streamId)
      
      return {
        id: streamId,
        sender: streamData.sender,
        recipient: streamData.recipient,
        deposit: streamData.deposit,
        tokenAddress: streamData.tokenAddress,
        startTime: streamData.startTime.toNumber(),
        stopTime: streamData.stopTime.toNumber(),
        remainingBalance: streamData.remainingBalance,
        ratePerSecond: streamData.ratePerSecond,
        isActive: streamData.remainingBalance.gt(0)
      }
    } catch (error: any) {
      if (error.message.includes('stream does not exist')) {
        return null
      }
      throw new AppError(`Failed to fetch stream: ${error.message}`, 'STREAM_FETCH_FAILED')
    }
  })

  withdrawFromStream = handleAsyncError(async (streamId: string, amount?: BigNumber): Promise<string> => {
    try {
      const stream = await this.getStream(streamId)
      if (!stream) {
        throw new AppError('Stream not found', 'STREAM_NOT_FOUND')
      }

      const withdrawAmount = amount || stream.remainingBalance

      const estimatedGas = await this.sablierContract.estimateGas.withdrawFromStream(
        streamId,
        withdrawAmount
      )

      const gasLimit = estimatedGas.mul(120).div(100)

      const tx = await this.sablierContract.withdrawFromStream(streamId, withdrawAmount, {
        gasLimit
      })

      const receipt = await tx.wait()
      return receipt.transactionHash
    } catch (error: any) {
      throw new AppError(`Failed to withdraw from stream: ${error.message}`, 'WITHDRAWAL_FAILED')
    }
  })

  cancelStream = handleAsyncError(async (streamId: string): Promise<string> => {
    try {
      const estimatedGas = await this.sablierContract.estimateGas.cancelStream(streamId)
      const gasLimit = estimatedGas.mul(120).div(100)

      const tx = await this.sablierContract.cancelStream(streamId, { gasLimit })
      const receipt = await tx.wait()
      
      return receipt.transactionHash
    } catch (error: any) {
      throw new AppError(`Failed to cancel stream: ${error.message}`, 'CANCELLATION_FAILED')
    }
  })

  getStreamStatus = (stream: Stream): StreamStatus => {
    const now = Math.floor(Date.now() / 1000)
    
    if (stream.remainingBalance.eq(0)) {
      return StreamStatus.COMPLETED
    }
    
    if (now < stream.startTime) {
      return StreamStatus.PENDING
    }
    
    if (now >= stream.stopTime) {
      return StreamStatus.COMPLETED
    }
    
    return StreamStatus.ACTIVE
  }

  calculateStreamedAmount = (stream: Stream): BigNumber => {
    const now = Math.floor(Date.now() / 1000)
    const effectiveTime = Math.min(now, stream.stopTime)
    const elapsedTime = Math.max(0, effectiveTime - stream.startTime)
    
    return stream.ratePerSecond.mul(elapsedTime)
  }
}