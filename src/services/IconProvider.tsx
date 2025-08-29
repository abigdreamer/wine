import React, { ReactNode } from 'react';
import { IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { IconRegistryService } from './iconRegistry.service';

interface IconProviderProps {
    children: ReactNode;
}

// Register Eva Icons pack by default
IconRegistryService.register(EvaIconsPack);

export const IconProvider = ({ children }: IconProviderProps): React.ReactElement => {
    return (
        <>
            <IconRegistry icons={EvaIconsPack} />
            {children}
        </>
    );
};
