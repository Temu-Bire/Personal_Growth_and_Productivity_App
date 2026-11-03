import { create } from 'zustand';
import {
  SidebarNavItem,
  DashboardWidgetConfig,
  PageLayoutConfig,
  ThemeCustomization,
  GeneralPreferences,
} from '../features/customization/customization.types';
import {
  CustomizationRepository,
  DEFAULT_SIDEBAR_ITEMS,
  DEFAULT_DASHBOARD_WIDGETS,
} from '../features/customization/customization.repository';
import { generateId } from '../utils/id';

const PREF_KEYS = {
  SIDEBAR: 'pref_sidebar_items',
  DASHBOARD: 'pref_dashboard_widgets',
  LAYOUTS: 'pref_page_layouts',
  THEME: 'pref_theme_customization',
  GENERAL: 'pref_general_preferences',
};

const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  paletteId: 'default',
  fontSizeScale: 'medium',
  density: 'normal',
};

const DEFAULT_GENERAL_PREFS: GeneralPreferences = {
  dateFormat: 'YYYY-MM-DD',
  weekStartDay: 'monday',
  soundEnabled: true,
  hapticsEnabled: true,
};

interface CustomizationState {
  isLoaded: boolean;
  sidebarItems: SidebarNavItem[];
  dashboardWidgets: DashboardWidgetConfig[];
  pageLayouts: Record<string, PageLayoutConfig>;
  themeCustomization: ThemeCustomization;
  generalPreferences: GeneralPreferences;

  // Actions
  loadCustomization: () => void;
  // Sidebar
  updateSidebarItems: (items: SidebarNavItem[]) => void;
  toggleSidebarItemVisibility: (id: string) => void;
  renameSidebarItem: (id: string, newLabel: string, newIcon?: string) => void;
  addCustomSidebarItem: (item: { label: string; routeName?: string; icon: any; category?: string }) => void;
  deleteSidebarItem: (id: string) => boolean;
  resetSidebarToDefault: () => void;
  // Dashboard
  updateDashboardWidgets: (widgets: DashboardWidgetConfig[]) => void;
  toggleDashboardWidget: (id: string) => void;
  setWidgetSize: (id: string, size: 'full' | 'half') => void;
  reorderDashboardWidgets: (widgets: DashboardWidgetConfig[]) => void;
  resetDashboardToDefault: () => void;
  // Layouts
  updatePageLayout: (pageKey: string, config: Partial<PageLayoutConfig>) => void;
  // Theme & Appearance
  updateThemeCustomization: (updates: Partial<ThemeCustomization>) => void;
  resetThemeToDefault: () => void;
  // General Preferences
  updateGeneralPreferences: (updates: Partial<GeneralPreferences>) => void;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  isLoaded: false,
  sidebarItems: DEFAULT_SIDEBAR_ITEMS,
  dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
  pageLayouts: {},
  themeCustomization: DEFAULT_THEME_CUSTOMIZATION,
  generalPreferences: DEFAULT_GENERAL_PREFS,

  loadCustomization: () => {
    try {
      const sidebar = CustomizationRepository.getPreference<SidebarNavItem[]>(
        PREF_KEYS.SIDEBAR,
        DEFAULT_SIDEBAR_ITEMS
      );
      const dashboard = CustomizationRepository.getPreference<DashboardWidgetConfig[]>(
        PREF_KEYS.DASHBOARD,
        DEFAULT_DASHBOARD_WIDGETS
      );
      const layouts = CustomizationRepository.getPreference<Record<string, PageLayoutConfig>>(
        PREF_KEYS.LAYOUTS,
        {}
      );
      const theme = CustomizationRepository.getPreference<ThemeCustomization>(
        PREF_KEYS.THEME,
        DEFAULT_THEME_CUSTOMIZATION
      );
      const general = CustomizationRepository.getPreference<GeneralPreferences>(
        PREF_KEYS.GENERAL,
        DEFAULT_GENERAL_PREFS
      );

      set({
        isLoaded: true,
        sidebarItems: sidebar,
        dashboardWidgets: dashboard,
        pageLayouts: layouts,
        themeCustomization: theme,
        generalPreferences: general,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  // Sidebar actions
  updateSidebarItems: (items: SidebarNavItem[]) => {
    set({ sidebarItems: items });
    CustomizationRepository.setPreference(PREF_KEYS.SIDEBAR, items);
  },

  toggleSidebarItemVisibility: (id: string) => {
    const current = get().sidebarItems;
    const updated = current.map((item) =>
      item.id === id ? { ...item, isHidden: !item.isHidden } : item
    );
    get().updateSidebarItems(updated);
  },

  renameSidebarItem: (id: string, newLabel: string, newIcon?: string) => {
    const current = get().sidebarItems;
    const updated = current.map((item) =>
      item.id === id
        ? {
            ...item,
            label: newLabel.trim() || item.label,
            icon: (newIcon as any) || item.icon,
          }
        : item
    );
    get().updateSidebarItems(updated);
  },

  addCustomSidebarItem: ({ label, routeName, icon, category }) => {
    const current = get().sidebarItems;
    const newItem: SidebarNavItem = {
      id: generateId('nav'),
      routeName: routeName || 'DashboardScreen',
      label: label.trim(),
      icon: icon || 'bookmark-outline',
      isHidden: false,
      isSystem: false,
      isCustom: true,
      order: current.length,
      category: category || 'Custom Pages',
    };
    get().updateSidebarItems([...current, newItem]);
  },

  deleteSidebarItem: (id: string) => {
    const current = get().sidebarItems;
    const target = current.find((i) => i.id === id);
    if (!target || target.isSystem) {
      return false; // System items are protected
    }
    const updated = current.filter((i) => i.id !== id);
    get().updateSidebarItems(updated);
    return true;
  },

  resetSidebarToDefault: () => {
    get().updateSidebarItems(DEFAULT_SIDEBAR_ITEMS);
  },

  // Dashboard actions
  updateDashboardWidgets: (widgets: DashboardWidgetConfig[]) => {
    set({ dashboardWidgets: widgets });
    CustomizationRepository.setPreference(PREF_KEYS.DASHBOARD, widgets);
  },

  toggleDashboardWidget: (id: string) => {
    const current = get().dashboardWidgets;
    const updated = current.map((w) =>
      w.id === id ? { ...w, isEnabled: !w.isEnabled } : w
    );
    get().updateDashboardWidgets(updated);
  },

  setWidgetSize: (id: string, size: 'full' | 'half') => {
    const current = get().dashboardWidgets;
    const updated = current.map((w) =>
      w.id === id ? { ...w, size } : w
    );
    get().updateDashboardWidgets(updated);
  },

  reorderDashboardWidgets: (widgets: DashboardWidgetConfig[]) => {
    get().updateDashboardWidgets(widgets);
  },

  resetDashboardToDefault: () => {
    get().updateDashboardWidgets(DEFAULT_DASHBOARD_WIDGETS);
  },

  // Layouts
  updatePageLayout: (pageKey: string, config: Partial<PageLayoutConfig>) => {
    const layouts = { ...get().pageLayouts };
    const existing = layouts[pageKey] || {
      viewMode: 'card',
      sortBy: 'created_at',
      sortDirection: 'desc',
      visibleFields: [],
    };
    layouts[pageKey] = { ...existing, ...config };
    set({ pageLayouts: layouts });
    CustomizationRepository.setPreference(PREF_KEYS.LAYOUTS, layouts);
  },

  // Theme
  updateThemeCustomization: (updates: Partial<ThemeCustomization>) => {
    const current = get().themeCustomization;
    const updated = { ...current, ...updates };
    set({ themeCustomization: updated });
    CustomizationRepository.setPreference(PREF_KEYS.THEME, updated);
  },

  resetThemeToDefault: () => {
    get().updateThemeCustomization(DEFAULT_THEME_CUSTOMIZATION);
  },

  // General
  updateGeneralPreferences: (updates: Partial<GeneralPreferences>) => {
    const current = get().generalPreferences;
    const updated = { ...current, ...updates };
    set({ generalPreferences: updated });
    CustomizationRepository.setPreference(PREF_KEYS.GENERAL, updated);
  },
}));

