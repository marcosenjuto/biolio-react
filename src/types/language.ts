export type Language = 'en' | 'es' | 'it' | 'de' | 'pt' | 'zh' | 'fr' | 'ar';

export interface Translations {
  common: {
    loading: string;
    error: string;
    noResults: string;
    clearFilters: string;
    search: string;
    viewProfile: string;
    learnMore: string;
  };
  navigation: {
    home: string;
    profile: string;
    chemistry: string;
    biopilot: string;
  };
  home: {
    welcome: string;
    subtitle: string;
    chemistryLibrary: string;
    libraryTitle: string;
    librarySubtitle: string;
    organicReactions: string;
    reactionCategories: string;
    smilesNotation: string;
    exploreLibrary: string;
    aboutTitle: string;
    aboutText: string;
  };
  library: {
    title: string;
    subtitle: string;
    functionalGroups: string;
    reactions: string;
    reaction: string;
    reactions_plural: string;
    noReactionsFound: string;
    tryAdjusting: string;
  };
  profile: {
    emptyMessage: string;
    aboutMe: string;
    contact: string;
    email: string;
    socialLinks: string;
    language: string;
    selectLanguage: string;
  };
  chat: {
    placeholder: string;
    send: string;
    noResponse: string;
    mockResponse: string;
  };
  filters: {
    searchPlaceholder: string;
    hide: string;
    show: string;
    category: string;
    searchCategories: string;
    functionalGroup: string;
    searchGroups: string;
    viewer: string;
    searchViewers: string;
    expandAll: string;
    collapseAll: string;
    namedReactions: string;
    reactionCategory: string;
    selectCategory: string;
    selectGroup: string;
    moleculeViewer: string;
    selectViewer: string;
    clearAll: string;
    applyFilters: string;
    allReactions: string;
    allGroups: string;
    categories: {
      oxidation: string;
      reduction: string;
      addition: string;
      substitution: string;
      condensation: string;
      grignard: string;
    };
    viewers: {
      rdkit: string;
      rdkitDesc: string;
      threeDmol: string;
      threeDmolDesc: string;
      formula: string;
      formulaDesc: string;
    };
  };
  footer: {
    rights: string;
    contact: string;
    github: string;
    linkedin: string;
    twitter: string;
  };
  contact: {
    title: string;
    subtitle: string;
    successTitle: string;
    successMessage: string;
    sendAnother: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    sending: string;
    send: string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
}
