export interface NavItem {
    label: MessageKeyType;
    href: string;
    icon: ReactNode;
    activeLink?: {
        strict?: string[];
        safe?: string[];
    };
}

export interface NavGroup {
    label?: MessageKeyType;
    items: NavItem[];
}
