import { EventEmitter } from '../../../stencil-public-runtime';
import type { TokenMetadata } from '../../../utils/types/api.types';
export declare class TokenItem {
    token: TokenMetadata;
    tokenClick: EventEmitter<TokenMetadata>;
    private formatPrice;
    private formatPriceChange;
    private formatVolume;
    private handleClick;
    render(): any;
}
//# sourceMappingURL=token-item.d.ts.map