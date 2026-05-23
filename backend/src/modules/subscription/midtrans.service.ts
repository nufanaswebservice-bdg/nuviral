import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private snap: midtransClient.Snap;
  private coreApi: midtransClient.CoreApi;

  constructor(private configService: ConfigService) {
    const isProduction = this.configService.get('MIDTRANS_IS_PRODUCTION') === 'true';
    const serverKey = this.configService.get('MIDTRANS_SERVER_KEY') || '';
    const clientKey = this.configService.get('MIDTRANS_CLIENT_KEY') || '';

    this.snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    this.coreApi = new midtransClient.CoreApi({
      isProduction,
      serverKey,
      clientKey,
    });
  }

  async createTransaction(params: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    planName: string;
  }) {
    const parameter = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      item_details: [
        {
          id: params.planName.toLowerCase(),
          price: params.amount,
          quantity: 1,
          name: `NuViral ${params.planName} Plan - Monthly`,
        },
      ],
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      callbacks: {
        finish: `${this.configService.get('APP_URL')}/dashboard/billing?payment=success`,
        error: `${this.configService.get('APP_URL')}/dashboard/billing?payment=error`,
        pending: `${this.configService.get('APP_URL')}/dashboard/billing?payment=pending`,
      },
    };

    try {
      const transaction = await this.snap.createTransaction(parameter);
      this.logger.log(`Transaction created: ${params.orderId}`);
      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`);
      throw error;
    }
  }

  async getTransactionStatus(orderId: string) {
    try {
      return await this.coreApi.transaction.status(orderId);
    } catch (error) {
      this.logger.error(`Failed to get transaction status: ${error.message}`);
      throw error;
    }
  }

  verifyNotificationSignature(notification: any): boolean {
    const crypto = require('crypto');
    const serverKey = this.configService.get('MIDTRANS_SERVER_KEY') || '';

    const signatureKey = notification.signature_key;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;

    const hash = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    return hash === signatureKey;
  }
}
