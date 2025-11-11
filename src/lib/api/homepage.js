// lib/api/homepage.js - HomePage CMS API Client

import apiClient from './client';

// ============================================
// PUBLIC APIs
// ============================================

/**
 * Get active homepage
 * @param {string} lang - Language (he/en)
 * @param {boolean} preview - Preview mode
 */
export const getActiveHomePage = async (lang = 'he', preview = false) => {
  const params = new URLSearchParams({ lang });
  if (preview) params.append('preview', 'true');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homepage?${params}`);
  if (!response.ok) throw new Error('Failed to fetch homepage');
  return response.json();
};

/**
 * Get specific section
 * @param {string} sectionId - Section ID
 */
export const getSection = async (sectionId) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homepage/sections/${sectionId}`);
  if (!response.ok) throw new Error('Failed to fetch section');
  return response.json();
};

// ============================================
// ADMIN APIs - HomePage Management
// ============================================

/**
 * Get all homepages (Admin)
 */
export const getAllHomePages = async () => {
  return apiClient.get('/homepage/admin');
};

/**
 * Get homepage by ID (Admin)
 * @param {string} id - HomePage ID
 */
export const getHomePageById = async (id) => {
  return apiClient.get(`/homepage/admin/${id}`);
};

/**
 * Create new homepage (Admin)
 * @param {Object} data - HomePage data
 */
export const createHomePage = async (data) => {
  return apiClient.post('/homepage/admin', data);
};

/**
 * Update homepage (Admin)
 * @param {string} id - HomePage ID
 * @param {Object} data - HomePage data
 */
export const updateHomePage = async (id, data) => {
  return apiClient.put(`/homepage/admin/${id}`, data);
};

/**
 * Delete homepage (Admin)
 * @param {string} id - HomePage ID
 */
export const deleteHomePage = async (id) => {
  return apiClient.delete(`/homepage/admin/${id}`);
};

/**
 * Toggle homepage active status (Admin)
 * @param {string} id - HomePage ID
 */
export const toggleHomePageStatus = async (id) => {
  return apiClient.patch(`/homepage/admin/${id}/toggle`);
};

/**
 * Clone homepage (Admin)
 * @param {string} id - HomePage ID
 * @param {string} name - New homepage name
 */
export const cloneHomePage = async (id, name) => {
  return apiClient.post(`/homepage/admin/${id}/clone`, { name });
};

/**
 * Get homepage statistics (Admin)
 * @param {string} id - HomePage ID
 */
export const getHomePageStats = async (id) => {
  return apiClient.get(`/homepage/admin/${id}/stats`);
};

// ============================================
// ADMIN APIs - Sections Management
// ============================================

/**
 * Add section to homepage (Admin)
 * @param {string} homePageId - HomePage ID
 * @param {Object} sectionData - Section data
 */
export const addSection = async (homePageId, sectionData) => {
  return apiClient.post(`/homepage/admin/${homePageId}/sections`, sectionData);
};

/**
 * Update section (Admin)
 * @param {string} homePageId - HomePage ID
 * @param {string} sectionId - Section ID
 * @param {Object} data - Section data
 */
export const updateSection = async (homePageId, sectionId, data) => {
  return apiClient.put(`/homepage/admin/${homePageId}/sections/${sectionId}`, data);
};

/**
 * Delete section (Admin)
 * @param {string} homePageId - HomePage ID
 * @param {string} sectionId - Section ID
 */
export const deleteSection = async (homePageId, sectionId) => {
  return apiClient.delete(`/homepage/admin/${homePageId}/sections/${sectionId}`);
};

/**
 * Reorder sections (Admin)
 * @param {string} homePageId - HomePage ID
 * @param {Array} sections - Array of {sectionId, displayOrder}
 */
export const reorderSections = async (homePageId, sections) => {
  return apiClient.put(`/homepage/admin/${homePageId}/sections/reorder`, { sections });
};

/**
 * Toggle section visibility (Admin)
 * @param {string} homePageId - HomePage ID
 * @param {string} sectionId - Section ID
 */
export const toggleSectionVisibility = async (homePageId, sectionId) => {
  return apiClient.patch(`/homepage/admin/${homePageId}/sections/${sectionId}/toggle`);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create empty section template
 * @param {string} type - Section type
 */
export const createEmptySection = (type) => {
  const templates = {
    hero_image: {
      type: 'hero_image',
      displayOrder: 0,
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      content: {
        heroImage: {
          desktopImage: {
            url: '',
            alt: '',
            width: 2600,
            height: 896
          },
          mobileImage: {
            url: '',
            alt: '',
            width: 1080,
            height: 1350
          },
          link: '',
          openInNewTab: false
        }
      },
      containerStyling: {
        backgroundColor: '#ffffff',
        padding: '0',
        margin: '0',
        maxWidth: '100%'
      }
    },
    hero_banner: {
      type: 'hero_banner',
      displayOrder: 0,
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      content: {
        heroBanner: {
          images: [],
          autoplay: { enabled: true, interval: 5000 },
          overlay: { enabled: false, color: 'rgba(0,0,0,0.3)', opacity: 0.3 },
          text: {
            he: { title: '', subtitle: '', ctaText: '' },
            en: { title: '', subtitle: '', ctaText: '' }
          },
          styling: {
            height: '600px',
            textPosition: 'center',
            textColor: '#ffffff',
            animation: 'fade'
          }
        }
      },
      containerStyling: {
        backgroundColor: '#000000',
        padding: '0',
        margin: '0',
        maxWidth: '100%'
      }
    },
    category_grid: {
      type: 'category_grid',
      displayOrder: 0,
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      content: {
        categoryGrid: {
          title: { he: '', en: '' },
          categories: [],
          displayMode: 'all',
          layout: {
            columns: { desktop: 4, tablet: 2, mobile: 1 },
            gap: '24px',
            cardStyle: 'modern'
          }
        }
      },
      containerStyling: {
        backgroundColor: '#ffffff',
        padding: '60px 20px',
        margin: '0',
        maxWidth: '1200px'
      }
    },
    product_carousel: {
      type: 'product_carousel',
      displayOrder: 0,
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      content: {
        productCarousel: {
          title: { he: '', en: '' },
          products: [],
          productSource: 'featured',
          limit: 12,
          layout: {
            itemsPerView: { desktop: 4, tablet: 2, mobile: 1 },
            spaceBetween: 20,
            navigation: true,
            pagination: true,
            autoplay: true
          }
        }
      },
      containerStyling: {
        backgroundColor: '#f9f9f9',
        padding: '60px 20px',
        margin: '0',
        maxWidth: '1200px'
      }
    },
    promotional_banner: {
      type: 'promotional_banner',
      displayOrder: 0,
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      content: {
        promotionalBanner: {
          image: { desktop: {}, mobile: {} },
          link: '',
          text: {
            he: { headline: '', subheadline: '', cta: '' },
            en: { headline: '', subheadline: '', cta: '' }
          },
          styling: {
            backgroundColor: '#000000',
            textColor: '#ffffff',
            alignment: 'center',
            padding: '60px 20px'
          }
        }
      },
      schedule: {
        enabled: false,
        startDate: null,
        endDate: null
      }
    },
    custom_component: {
      type: 'custom_component',
      displayOrder: 0,
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true },
      content: {
        customComponent: {
          name: '',
          html: { he: '', en: '' },
          css: '',
          componentType: 'html'
        }
      }
    }
  };

  return templates[type] || templates.hero_image;
};

export default {
  // Public
  getActiveHomePage,
  getSection,

  // Admin - HomePage
  getAllHomePages,
  getHomePageById,
  createHomePage,
  updateHomePage,
  deleteHomePage,
  toggleHomePageStatus,
  cloneHomePage,
  getHomePageStats,

  // Admin - Sections
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  toggleSectionVisibility,

  // Helpers
  createEmptySection
};
