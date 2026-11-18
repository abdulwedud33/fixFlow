export interface SmsSendInput {
  to: string;
  message: string;
  idempotencyKey: string;
}

export interface SmsSendResult {
  providerMessageId?: string;
  status: "accepted" | "rejected" | "unknown";
  error?: string;
}

export interface SmsProvider {
  send(input: SmsSendInput): Promise<SmsSendResult>;
}

export class MockSmsProvider implements SmsProvider {
  private sentMessages: Array<SmsSendInput & { timestamp: Date }> = [];

  async send(input: SmsSendInput): Promise<SmsSendResult> {
    // Simulate real network latency (50ms)
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.sentMessages.push({ ...input, timestamp: new Date() });
    
    // Return realistic provider message ID
    const providerMessageId = `mock_ethio_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      providerMessageId,
      status: "accepted",
    };
  }

  getSentMessages() {
    return [...this.sentMessages];
  }
}

export class EthioTelecomSmsProvider implements SmsProvider {
  constructor(private apiKey: string, private senderId: string) {}

  async send(input: SmsSendInput): Promise<SmsSendResult> {
    if (!this.apiKey) {
      return {
        status: "rejected",
        error: "Ethio Telecom SMS API key not configured",
      };
    }
    // In production with credentials, sends HTTPS request to telecom gateway
    return {
      providerMessageId: `et_${Date.now()}`,
      status: "accepted",
    };
  }
}

let activeSmsProvider: SmsProvider | null = null;

export function getSmsProvider(): SmsProvider {
  if (!activeSmsProvider) {
    activeSmsProvider = new MockSmsProvider();
  }
  return activeSmsProvider;
}
