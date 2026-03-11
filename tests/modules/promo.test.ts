import { HttpClient } from '../../src/utils/http';
import { PromoModule } from '../../src/modules/promo';

jest.mock('../../src/utils/http');
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>;

const mockResponse = (data: any) => ({ status: 200, statusText: 'OK', headers: {}, data });

describe('PromoModule', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let mod: PromoModule;

  beforeEach(() => {
    httpClient = new MockHttpClient({} as any) as jest.Mocked<HttpClient>;
    mod = new PromoModule(httpClient);
  });

  // ── Voucher ──

  it('checkVoucher sends GET with code param and unwraps result', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ valid: true, voucher_id: 'vch_1', discount_amount: 5000, discount_type: 'fixed' }));
    const result = await mod.checkVoucher('SUMMER25');
    expect(httpClient.get).toHaveBeenCalledWith('promo/vouchers/check?code=SUMMER25');
    expect(result.valid).toBe(true);
    expect(result.voucher_id).toBe('vch_1');
  });

  it('checkVoucher passes optional offer_id and amount', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ valid: true, discount_amount: 2500 }));
    await mod.checkVoucher('PROMO10', { offer_id: 'ofr_1', amount: 50000 });
    const url = httpClient.get.mock.calls[0][0];
    expect(url).toContain('code=PROMO10');
    expect(url).toContain('offer_id=ofr_1');
    expect(url).toContain('amount=50000');
  });

  it('checkVoucher returns invalid result with reason', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ valid: false, reason: 'expired' }));
    const result = await mod.checkVoucher('OLD_CODE');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  // ── Referral: getMyReferralCode ──

  it('getMyReferralCode sends GET without firstName', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ code: 'MIRA-ALICE42', share_url: 'https://www.hello-mira.com/invite/MIRA-ALICE42', total_enrollments: 3, total_confirmed: 1, total_rewards_eur: 200, reward_tiers: [], is_active: true }));
    const result = await mod.getMyReferralCode();
    expect(httpClient.get).toHaveBeenCalledWith('promo/referral/my-code');
    expect(result.code).toBe('MIRA-ALICE42');
  });

  it('getMyReferralCode sends GET with firstName query param', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ code: 'MIRA-BOB77', share_url: 'https://www.hello-mira.com/invite/MIRA-BOB77' }));
    await mod.getMyReferralCode('Bob');
    expect(httpClient.get).toHaveBeenCalledWith('promo/referral/my-code?first_name=Bob');
  });

  it('getMyReferralCode encodes special chars in firstName', async () => {
    httpClient.get.mockResolvedValue(mockResponse({ code: 'MIRA-JEAN99' }));
    await mod.getMyReferralCode('Jean-Pierre');
    const url = httpClient.get.mock.calls[0][0];
    expect(url).toContain('first_name=Jean-Pierre');
  });

  // ── Referral: getMyRewards ──

  it('getMyRewards sends GET and unwraps rewards list', async () => {
    const rewards = [
      { id: 'rfr_1', referral_rank: 1, amount_eur: 200, reward_type: 'mira_credit', status: 'issued', issued_at: '2026-01-15T00:00:00Z', created_at: '2026-01-15T00:00:00Z' },
    ];
    httpClient.get.mockResolvedValue(mockResponse({ rewards }));
    const result = await mod.getMyRewards();
    expect(httpClient.get).toHaveBeenCalledWith('promo/referral/my-rewards');
    expect(result.rewards).toHaveLength(1);
    expect(result.rewards[0].status).toBe('issued');
  });

  // ── Referral: enrollWithReferralCode ──

  it('enrollWithReferralCode sends POST with code body', async () => {
    httpClient.post.mockResolvedValue(mockResponse({ enrollment_id: 'rfe_1', referrer_user_id: 'usr_abc', expires_at: '2026-06-10T00:00:00Z' }));
    const result = await mod.enrollWithReferralCode('MIRA-ALICE42');
    expect(httpClient.post).toHaveBeenCalledWith('promo/referral/enroll', { code: 'MIRA-ALICE42' });
    expect(result.enrollment_id).toBe('rfe_1');
    expect(result.referrer_user_id).toBe('usr_abc');
  });
});
