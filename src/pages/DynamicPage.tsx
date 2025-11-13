import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, User, Eye, Heart, MessageCircle } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  type: string;
  status: string;
  author: string;
  featured_image: string | null;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  allow_comments: boolean;
  word_count: number;
  reading_time: number;
}

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      if (!slug) {
        setError('Page slug not provided');
        setLoading(false);
        return;
      }

      try {
        // Try to get content by slug first
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) {
          // If content table fails, try page_content table
          const { data: pageData, error: pageError } = await supabase
            .from('page_content')
            .select('*')
            .eq('page_id', slug)
            .eq('is_active', true)
            .single();

          if (pageError) {
            throw new Error('Page not found');
          }

          // Create a pseudo content item from page_content
          setContent({
            id: pageData.id,
            title: pageData.title,
            slug: pageData.page_id,
            content: pageData.content,
            excerpt: null,
            type: 'page',
            status: 'published',
            author: pageData.updated_by,
            featured_image: pageData.image_url,
            seo_meta_title: null,
            seo_meta_description: null,
            published_at: pageData.updated_at,
            created_at: pageData.updated_at,
            updated_at: pageData.updated_at,
            allow_comments: false,
            word_count: pageData.content.split(' ').length,
            reading_time: Math.ceil(pageData.content.split(' ').length / 200)
          });
        } else {
          setContent(data);
        }
      } catch (err) {
        console.error('Error fetching page content:', err);
        setError('Page not found or an error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [slug]);

  useEffect(() => {
    if (content) {
      // Update page title and meta description
      document.title = content.seo_meta_title || content.title;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', content.seo_meta_description || content.excerpt || '');
      }

      // Add Open Graph meta tags
      const addMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      addMetaTag('og:title', content.seo_meta_title || content.title);
      addMetaTag('og:description', content.seo_meta_description || content.excerpt || '');
      if (content.featured_image) {
        addMetaTag('og:image', content.featured_image);
      }
      addMetaTag('og:type', 'article');
    }
  }, [content]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The page you're looking for doesn't exist."}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {content.title}
          </h1>
          
          {content.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {content.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>By {content.author}</span>
            </div>
            
            {content.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Published {formatDate(content.published_at)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{content.reading_time} min read</span>
            </div>
          </div>

          {/* Featured Image */}
          {content.featured_image && (
            <div className="mb-8">
              <img
                src={content.featured_image}
                alt={content.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ 
            __html: content.content.replace(/\n/g, '<br>') 
          }}
        />

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>Like</span>
              </button>
              
              {content.allow_comments && (
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              Last updated {formatDate(content.updated_at)}
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default DynamicPage;