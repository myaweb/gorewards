<?php get_header(); ?>

<?php while ( have_posts() ) : the_post(); ?>

<div class="post-hero" style="text-align:left;">
    <h1 class="post-title" style="margin-left:0;"><?php the_title(); ?></h1>
</div>

<div class="content-grid">
    <article class="post-content">
        <?php the_content(); ?>
    </article>
    <aside class="sidebar">
        <div class="widget widget-cta">
            <h3 class="widget-title">Free Card Optimizer</h3>
            <p>Find the best Canadian credit card for your spending in 2 minutes.</p>
            <a href="https://GoRewards.net" class="btn btn-primary" target="_blank" rel="noopener">
                Try GoRewards Free →
            </a>
        </div>
        <?php if ( is_active_sidebar( 'sidebar-1' ) ) dynamic_sidebar( 'sidebar-1' ); ?>
    </aside>
</div>

<?php endwhile; ?>

<?php get_footer(); ?>
