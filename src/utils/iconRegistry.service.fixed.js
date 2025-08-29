"use strict";

function logPackNotFoundWarning(name) {
    console.warn(
        `Icon Pack '${name}' is not registered. Using default icon pack instead.`,
        '\nTo set up icons, see: https://akveo.github.io/react-native-ui-kitten/docs/guides/setting-up-icons'
    );
}

function logIconNotFoundWarning(name, pack) {
    console.warn(
        `Icon '${name}' is not found in pack '${pack}'.`,
        '\nCheck icon name or consider switching icon pack.',
        '\nSee: https://akveo.github.io/react-native-ui-kitten/docs/guides/setting-up-icons'
    );
}

/**
 * Enhanced icon registry service with better error handling and fallbacks
 */
class EnhancedRegistryService {
    packs = new Map();
    defaultPack;

    /**
     * Registers multiple icon packs and sets the first one as default if there is no default pack
     */
    register(...packs) {
        packs.forEach((pack) => {
            this.registerIconPack(pack);
            if (!this.defaultPack) {
                this.defaultPack = pack.name;
            }
        });
    }

    /**
     * Sets pack as default with warning instead of error if pack not found
     */
    setDefaultIconPack(name) {
        if (!this.packs.has(name)) {
            logPackNotFoundWarning(name);
            return;
        }
        this.defaultPack = name;
    }

    /**
     * Gets icon pack with fallback to first registered pack
     */
    getIconPack(name) {
        const pack = this.packs.get(name);
        if (!pack && this.packs.size > 0) {
            // Fallback to first registered pack
            const firstPack = this.packs.values().next().value;
            logPackNotFoundWarning(name);
            return firstPack;
        }
        return pack;
    }

    /**
     * Gets icon with better error handling and fallbacks
     */
    getIcon(name, packName) {
        let iconsPack;
        
        if (packName) {
            iconsPack = this.getIconPack(packName);
        } else {
            iconsPack = this.getDefaultPack();
        }

        if (!iconsPack) {
            return {
                name,
                pack: 'default',
                icon: null,
            };
        }

        const icon = this.getIconFromPack(name, iconsPack, false);
        
        return {
            name,
            pack: iconsPack.name,
            icon: icon || null,
        };
    }

    registerIconPack(pack) {
        if (!pack || !pack.name || !pack.icons) {
            console.warn('Invalid icon pack provided');
            return;
        }
        this.packs.set(pack.name, pack);
    }

    getDefaultPack() {
        if (!this.defaultPack && this.packs.size > 0) {
            // Set first pack as default if none set
            this.defaultPack = this.packs.values().next().value.name;
        }
        return this.getIconPack(this.defaultPack);
    }

    getIconFromPack(name, pack, shouldWarn = true) {
        if (!pack.icons[name] && shouldWarn) {
            logIconNotFoundWarning(name, pack.name);
        }
        return pack.icons[name] || null;
    }
}

// Create and export a singleton instance
exports.IconRegistryService = new EnhancedRegistryService();
