<?php get_header(); ?>

<!-- Archive / Blog header -->
<div class="archive-header">
    <?php if (is_category()) : ?>
        <div class="archive-eyebrow"><?php single_cat_title(); ?></div>
        <h1><?php single_cat_title(); ?></h1>
        <?php if (category_description()) : ?><p><?php echo category_description(); ?></p><?php endif; ?>
    <?php elseif (is_tag()) : ?>
        <div class="archive-eyebrow">Tag</div>
        <h1><?php single_tag_title(); ?></h1>
    <?php elseif (is_search()) : ?>
        <div class="archive-eyebrow">Search</div>
        <h1>Results for <span>"<?php echo get_search_query(); ?>"</span></h1>
    <?php else : ?>
        <div class="archive-eyebrow">GoRewards Blog</div>
        <h1>Canadian Credit Card <span>Insights</span></h1>
        <p>Tips, guides and strategies to maximize your rewards.</p>
    <?php endif; ?>
</div>

<!-- Category pills -->
<div class="cat-pills">
    <a href="<?php echo esc_url(get_bloginfo('url')); ?>/blog" class="cat-pill <?php echo (!is_category()) ? 'active' : ''; ?>">All</a>
    <?php
    $cats = get_categories(['hide_empty' => true, 'number' => 8]);
    foreach ($cats as $cat) :
        $active = is_category($cat->term_id) ? 'active' : '';
    ?>
        <a href="<?php echo esc_url(get_category_link($cat->term_id)); ?>" class="cat-pill <?php echo $active; ?>">
            <?php echo esc_html($cat->name); ?>
        </a>
    <?php endforeach; ?>
</div>

<?php if (have_posts()) : ?>

    <p class="section-label">Latest Articles</p>

    <div class="posts-grid">
        <?php while (have_posts()) : the_post();
            $cats = get_the_category(); ?>

            <article <?php post_class('post-card'); ?>>
                <a href="<?php the_permalink(); ?>" class="card-thumb">
                    <?php if (has_post_thumbnail()) : ?>
                        <?php the_post_thumbnail('GoRewards-card', ['alt' => get_the_title()]); ?>
                        <span class="card-read-time"><?php echo GoRewards_reading_time(); ?></span>
                    <?php else : ?>
                        <div class="card-thumb-placeholder">💳</div>
                    <?php endif; ?>
                </a>
                <div class="card-body">
                    <div class="card-meta-top">
                        <?php if ($cats) : ?>
                            <span class="card-cat">
                                <a href="<?php echo esc_url(get_category_link($cats[0]->term_id)); ?>">
                                    <?php echo esc_html($cats[0]->name); ?>
                                </a>
                            </span>
                        <?php endif; ?>
                        <span class="card-date"><?php echo get_the_date('M j, Y'); ?></span>
                    </div>
                    <h2 class="card-title">
                        <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                    </h2>
                    <p class="card-excerpt"><?php echo wp_trim_words(get_the_excerpt(), 18); ?></p>
                    <div class="card-footer">
                        <div class="card-author">
                            <div class="card-avatar"><?php echo strtoupper(substr(get_the_author(), 0, 2)); ?></div>
                            <span class="card-author-name"><?php the_author(); ?></span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                </div>
            </article>

        <?php endwhile; ?>
    </div>

    <div class="pagination">
        <?php echo paginate_links(['prev_text' => '← Prev', 'next_text' => 'Next →']); ?>
    </div>

<?php else : ?>
    <p style="color:var(--muted);text-align:center;padding:5rem 0;">No posts found.</p>
<?php endif; ?>

<?php get_footer(); ?>
