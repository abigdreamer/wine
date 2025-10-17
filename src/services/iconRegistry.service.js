"use strict";

/**
 * Enhanced version of UI Kitten's IconRegistryService with better error handling
 */
class RegistryService {
    packs = new Map();
    defaultPack;

    register(...packs) {
        packs.forEach((pack) => {
            if (pack && pack.name && pack.icons) {
                this.registerIconPack(pack);
                // Set first pack as default if no default is set
                if (!this.defaultPack) {
                    this.defaultPack = pack.name;
                }
            } else {
                console.warn('Invalid icon pack provided:', pack);
            }
        });
    }

    setDefaultIconPack(name) {
        if (!this.packs.has(name)) {
            console.warn(
                `Icon Pack '${name}' is not registered. Default pack will not be changed.`,
                '\nSee: https://akveo.github.io/react-native-ui-kitten/docs/guides/setting-up-icons'
            );
            return;
        }
        this.defaultPack = name;
    }

    getIconPack(name) {
        const pack = this.packs.get(name);
        if (!pack && name) {
            console.warn(
                `Icon Pack '${name}' not found. Using default pack.`,
                '\nSee: https://akveo.github.io/react-native-ui-kitten/docs/guides/setting-up-icons'
            );
        }
        return pack || this.getDefaultPack();
    }

    getIcon(name, pack) {
        try {
            const iconsPack = pack ? this.getIconPack(pack) : this.getDefaultPack();
            
            if (!iconsPack) {
                console.warn('No icon packs registered. Please register at least one icon pack.');
                return { name, pack: 'default', icon: null };
            }

            const icon = this.getIconFromPack(name, iconsPack);
            return {
                name,
                pack: iconsPack.name,
                icon: icon || null,
            };
        } catch (error) {
            console.warn('Error getting icon:', error);
            return { name, pack: 'default', icon: null };
        }
    }

    registerIconPack(pack) {
        if (!pack || !pack.name || !pack.icons) {
            console.warn('Invalid icon pack:', pack);
            return;
        }
        this.packs.set(pack.name, pack);
    }

    getDefaultPack() {
        // If no default pack is set but we have packs, use the first one
        if (!this.defaultPack && this.packs.size > 0) {
            this.defaultPack = this.packs.keys().next().value;
        }
        return this.packs.get(this.defaultPack);
    }

    getIconFromPack(name, pack) {
        if (!pack?.icons?.[name]) {
            console.warn(
                `Icon '${name}' not found in pack '${pack?.name}'.`,
                '\nSee: https://akveo.github.io/react-native-ui-kitten/docs/guides/setting-up-icons'
            );
            return null;
        }
        return pack.icons[name];
    }
}

// Export a singleton instance
exports.IconRegistryService = new RegistryService();
