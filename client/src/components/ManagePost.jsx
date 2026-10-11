import { useState } from 'react';
import PropTypes from 'prop-types';
import { postService } from '../services/post.service';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';
import { ConfirmDialog } from './ui/ConfirmDialog';

export default function ManagePost({ post, onUpdate }) {
    const { user } = useAuth();
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const handleSaveEdit = async (postId, content, tags) => {
        try {
            await postService.editPost(postId, content, tags);
            onUpdate();
        } catch (err) {
            console.error('Error updating post:', err);
            throw err;
        }
    };

    const handleDelete = async (postId) => {
        setConfirmingDelete(postId);
    };

    const confirmDelete = async () => {
        try {
            await postService.deletePost(confirmingDelete);
            onUpdate();
        } catch (err) {
            console.error('Error deleting post:', err);
        } finally {
            setConfirmingDelete(false);
        }
    };

    return (
        <>
            <PostCard
                post={post}
                currentUserId={user?._id}
                showOwnerActions
                onSaveEdit={handleSaveEdit}
                onDelete={handleDelete}
                allowCommentEdit
                onCommentUpdate={onUpdate}
            />
            <ConfirmDialog
                open={!!confirmingDelete}
                onOpenChange={(open) => !open && setConfirmingDelete(false)}
                title="Delete this post?"
                description="This can't be undone."
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </>
    );
}

ManagePost.propTypes = {
    post: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};
