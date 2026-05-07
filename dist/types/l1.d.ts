export interface L1Request {
    action: string;
    request_id: string;
    sig?: string;
    [key: string]: unknown;
}
/** L1Request with signature attached — used for all mutating operations after signing */
export interface SignedL1Request extends L1Request {
    sig: string;
}
export interface L1Response<T = unknown> {
    code: number;
    request_id: string;
    data?: T;
    error?: string;
    msg?: string;
}
/** Yellow Pages response codes */
export declare const YP_CODE: {
    readonly OK: 0;
    readonly SIG_INVALID: 1001;
    readonly OPENID_EXISTS: 1002;
    readonly MISSING_FIELDS: 1003;
    readonly TAGS_TOO_LONG: 1004;
    readonly DESCRIPTION_TOO_LONG: 1005;
    readonly UUID_EXISTS: 1006;
    readonly ENTRY_NOT_FOUND: 1007;
};
export type YpCode = (typeof YP_CODE)[keyof typeof YP_CODE];
export interface YpEntry {
    openid: string;
    tags: string[];
    description: string;
    registered_at?: string;
    updated_at?: string;
    last_heartbeat?: string;
}
/** High-level publish options — one call instead of createServiceKey + setIdentity + registerService + startHeartbeat */
export interface PublishOptions {
    tags: string[];
    description: string;
    autoHeartbeat?: boolean;
}
export interface YpDiscoverRequest extends L1Request {
    action: 'discover';
    tags?: string[];
    limit?: number;
    cursor?: string | null;
}
export interface YpRegisterRequest extends L1Request {
    action: 'register_service';
    openid: string;
    tags: string[];
    description: string;
    public_key: string;
}
export interface YpHeartbeatRequest extends L1Request {
    action: 'heartbeat';
    openid: string;
}
export interface YpUpdateRequest extends L1Request {
    action: 'update_service';
    openid: string;
    tags?: string[];
    description?: string;
}
export interface YpDeregisterRequest extends L1Request {
    action: 'deregister_service';
    openid: string;
}
export interface CaApplyRequest extends L1Request {
    action: 'apply_cert';
    application: {
        subject_openid: string;
        subject_name: string;
        requested_level: 'bronze' | 'silver' | 'gold';
        contact_email: string;
        contact_person: string;
        contact_phone: string;
        business_scope: string;
        website?: string;
        supporting_documents?: Array<{
            type: string;
            url: string;
            hash: string;
        }>;
        public_key: string;
    };
}
export interface CaChallengeRequest extends L1Request {
    action: 'cert_challenge';
    application_id: string;
    challenge: {
        nonce: string;
        instruction: string;
        expires_in: number;
    };
}
export interface CaChallengeResponse extends L1Request {
    action: 'cert_challenge_response';
    application_id: string;
    signed_nonce: string;
}
export interface CaVerifyRequest extends L1Request {
    action: 'verify_cert';
    cert_id: string;
}
export interface CaCRLRequest extends L1Request {
    action: 'get_crl';
}
export interface ReputationTagRequest extends L1Request {
    action: 'tag';
    target_openid: string;
    label: string;
    evidence?: Record<string, unknown>;
    public_key: string;
}
export interface ReputationUntagRequest extends L1Request {
    action: 'untag';
    target_openid: string;
    label: string;
    public_key: string;
}
export interface ReputationQueryRequest extends L1Request {
    action: 'query_reputation';
    openids: string[];
}
export interface ReputationResult {
    openid: string;
    total_sessions: number;
    age_days: number;
    core_tags: Record<string, number>;
    free_tags: Record<string, number>;
    error?: string;
}
//# sourceMappingURL=l1.d.ts.map