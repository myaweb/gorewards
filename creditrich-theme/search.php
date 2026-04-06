<?php get_header(); ?>

<div class="archive-header">
    <h1><?php printf( __( 'Search results for: %s', 'GoRewards' ), '<span>' . get_search_query() . '</span>' ); ?></h1>
</div>

<?php get_template_part( 'index' ); ?>
