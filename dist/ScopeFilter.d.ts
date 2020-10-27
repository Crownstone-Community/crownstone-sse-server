export declare function generateFilterFromScope(scopes: oauthScope[], userId: string): ScopeFilter | true;
export declare function checkScopePermissions(scopeFilter: ScopeFilter | true, eventData: SseDataEvent): boolean;
