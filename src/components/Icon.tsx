import React from 'react';
import { Icon as UIKittenIcon, IconProps } from '@ui-kitten/components';
import { IconRegistryService } from '../utils/iconRegistry.service.fixed';

interface EnhancedIconProps extends Omit<IconProps, 'name'> {
    name: string;
    pack?: string;
}

export const Icon = ({ name, pack, ...props }: EnhancedIconProps): React.ReactElement => {
    // Ensure we have a registered pack
    const iconPack = IconRegistryService.getIconPack(pack);
    const defaultPack = IconRegistryService.getDefaultPack();
    
    // Use pack name if valid, otherwise fallback to default
    const safePack = iconPack ? pack : defaultPack?.name;

    return (
        <UIKittenIcon
            name={name}
            pack={safePack}
            {...props}
        />
    );
};
