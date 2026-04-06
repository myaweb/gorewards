<?php if ( post_password_required() ) return; ?>

<div id="comments" class="comments-area">

    <?php if ( have_comments() ) : ?>
        <h2 class="comments-title">
            <?php printf( _n( '%s Comment', '%s Comments', get_comments_number(), 'GoRewards' ), number_format_i18n( get_comments_number() ) ); ?>
        </h2>

        <ul class="comment-list">
            <?php wp_list_comments( [
                'style'       => 'ul',
                'short_ping'  => true,
                'callback'    => 'GoRewards_comment',
            ] ); ?>
        </ul>

        <?php the_comments_pagination(); ?>
    <?php endif; ?>

    <?php if ( comments_open() ) : ?>
        <?php comment_form( [
            'title_reply'         => __( 'Leave a Comment', 'GoRewards' ),
            'title_reply_before'  => '<h3 class="comments-title">',
            'title_reply_after'   => '</h3>',
            'submit_button'       => '<button type="submit" class="btn btn-primary">%4$s</button>',
        ] ); ?>
    <?php endif; ?>

</div>

<?php
function GoRewards_comment( $comment, $args, $depth ) {
    ?>
    <li <?php comment_class( 'comment' ); ?> id="comment-<?php comment_ID(); ?>">
        <div class="comment-author"><?php comment_author(); ?></div>
        <div class="comment-date"><?php comment_date(); ?></div>
        <div class="comment-content"><?php comment_text(); ?></div>
    </li>
    <?php
}
