<?php get_header(); ?>

<?php while (have_posts()) : the_post();
    $cats = get_the_category();
    $tags = get_the_tags();
    $author_id = get_the_author_meta('ID');
    $author_initials = strtoupper(substr(get_the_author(), 0, 2));
?>

<!-- Breadcrumb -->
<nav class="breadcrumb" aria-label="Breadcrumb">
    <a href="<?php echo esc_url(get_bloginfo('url')); ?>"><?php _e('Blog', 'creditrich'); ?></a>
    <span class="breadcrumb-sep">›</span>
    <?php if ($cats) : ?>
        <a href="<?php echo esc_url(get_category_link($cats[0]->term_id)); ?>"><?php echo esc_html($cats[0]->name); ?></a>
        <span class="breadcrumb-sep">›</span>
    <?php endif; ?>
    <span class="breadcrumb-current"><?php the_title(); ?></span>
</nav>

<!-- Post Hero -->
<header class="post-hero">
    <div class="post-hero-grid">
        <div class="post-hero-left">
            <?php if ($cats) : ?>
                <div class="post-cat-badge"><?php echo esc_html($cats[0]->name); ?></div>
            <?php endif; ?>
            <h1 class="post-title" id="post-title"><?php the_title(); ?></h1>
            <div class="post-meta-row">
                <div class="author-avatar"><?php echo $author_initials; ?></div>
                <div class="author-info">
                    <span class="author-name"><?php the_author(); ?></span>
                    <span class="post-date"><?php echo get_the_date(); ?></span>
                </div>
                <div class="meta-divider"></div>
                <div class="read-time-pill">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <?php echo creditrich_reading_time(); ?>
                </div>
                <?php if (get_the_modified_date() !== get_the_date()) : ?>
                    <div class="meta-divider"></div>
                    <span class="updated-badge">Updated <?php echo get_the_modified_date('M Y'); ?></span>
                <?php endif; ?>
            </div>
        </div>
        <?php if (has_post_thumbnail()) : ?>
            <div class="hero-image-wrap">
                <?php the_post_thumbnail('creditrich-hero', ['alt' => get_the_title()]); ?>
            </div>
        <?php endif; ?>
    </div>
</header>

<!-- Two-column layout -->
<div class="post-layout">

    <!-- Article -->
    <article class="article-body">
        <?php the_content(); ?>

        <!-- Tags -->
        <?php if ($tags) : ?>
            <div class="tags-section">
                <div class="tags-label">Tags</div>
                <div class="tags-list">
                    <?php foreach ($tags as $tag) : ?>
                        <a href="<?php echo esc_url(get_tag_link($tag->term_id)); ?>" class="tag">
                            <?php echo esc_html($tag->name); ?>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

        <!-- Author bio -->
        <div class="author-bio">
            <div class="author-bio-avatar"><?php echo $author_initials; ?></div>
            <div class="author-bio-content">
                <div class="author-bio-name"><?php the_author(); ?></div>
                <div class="author-bio-role"><?php echo get_the_author_meta('user_title', $author_id) ?: __('Author', 'creditrich'); ?></div>
                <?php if (get_the_author_meta('description', $author_id)) : ?>
                    <p class="author-bio-text"><?php echo get_the_author_meta('description', $author_id); ?></p>
                <?php endif; ?>
            </div>
        </div>
    </article>

    <!-- Sidebar -->
    <aside class="sidebar" aria-label="Article sidebar">

        <!-- CTA Widget -->
        <div class="cta-widget">
            <div class="cta-widget-icon">✦</div>
            <h4><?php _e('Find Your Perfect Card', 'creditrich'); ?></h4>
            <p><?php _e('Answer 3 quick questions and CreditRich will match you to the highest-value card for your spending.', 'creditrich'); ?></p>
            <a href="https://creditrich.net" class="cta-widget-btn" target="_blank" rel="noopener">Try CreditRich Free →</a>
            <div class="cta-widget-sub">No credit check · Takes 60 seconds</div>
        </div>

        <!-- TOC (populated by JS) -->
        <div class="toc-widget" id="toc-widget" style="display:none">
            <div class="widget-title">On This Page</div>
            <ul class="toc-list" id="toc"></ul>
        </div>

        <!-- Share Widget -->
        <div class="share-widget">
            <div class="widget-title">Share This Article</div>
            <div class="share-buttons">
                <button class="share-btn" onclick="shareX()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Share on X
                </button>
                <button class="share-btn" onclick="shareFacebook()">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Share on Facebook
                </button>
                <button class="share-btn" id="copy-btn" onclick="copyLink()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    <span id="copy-label">Copy Link</span>
                </button>
            </div>
        </div>

        <?php if (is_active_sidebar('sidebar-1')) : ?>
            <?php dynamic_sidebar('sidebar-1'); ?>
        <?php endif; ?>

    </aside>

</div><!-- .post-layout -->

<!-- Related posts -->
<?php
$related = new WP_Query([
    'category__in'   => wp_get_post_categories(get_the_ID()),
    'post__not_in'   => [get_the_ID()],
    'posts_per_page' => 3,
    'orderby'        => 'rand',
]);
if ($related->have_posts()) : ?>
    <div class="related-section">
        <div class="section-label">Related Articles</div>
        <div class="posts-grid">
            <?php while ($related->have_posts()) : $related->the_post();
                $rcats = get_the_category(); ?>
                <article <?php post_class('post-card'); ?>>
                    <a href="<?php the_permalink(); ?>" class="card-thumb">
                        <?php if (has_post_thumbnail()) : ?>
                            <?php the_post_thumbnail('creditrich-card', ['alt' => get_the_title()]); ?>
                            <span class="card-read-time"><?php echo creditrich_reading_time(); ?></span>
                        <?php else : ?>
                            <div class="card-thumb-placeholder">💳</div>
                        <?php endif; ?>
                    </a>
                    <div class="card-body">
                        <div class="card-meta-top">
                            <?php if ($rcats) : ?>
                                <span class="card-cat"><?php echo esc_html($rcats[0]->name); ?></span>
                            <?php endif; ?>
                            <span class="card-date"><?php echo get_the_date('M j, Y'); ?></span>
                        </div>
                        <h2 class="card-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                        <div class="card-footer">
                            <div class="card-author">
                                <div class="card-avatar"><?php echo strtoupper(substr(get_the_author(), 0, 2)); ?></div>
                                <span class="card-author-name"><?php the_author(); ?></span>
                            </div>
                            <div class="card-arrow">→</div>
                        </div>
                    </div>
                </article>
            <?php endwhile; wp_reset_postdata(); ?>
        </div>
    </div>
<?php endif; ?>

<!-- Comments -->
<?php if (comments_open() || get_comments_number()) : ?>
    <div class="comments-section">
        <?php comments_template(); ?>
    </div>
<?php endif; ?>

<?php endwhile; ?>

<?php get_footer(); ?>
