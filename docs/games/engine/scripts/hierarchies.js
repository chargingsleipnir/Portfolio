/**
 * Created by Devin on 2015-01-31.
 */

// Unfinished garbage

/********** FOR OBJECT FRUSTUM CULLING AND REAR-TO-FRONT ORGANIZATION **********/

function PotentialContact() {
    this.body = [];
}

// Binary Search Tree Node
function SphereHierarchyNode (volume, data) {
    this.children = []; // 2 other nodes
    this.parent = null;
    this.volume = volume; // The parenting sphere/box
    this.data = data; // The actual sphere/box collider data
}
SphereHierarchyNode.prototype = {
    Isleaf: function() {
        // Only leaves have collision bodies attached
        return this.data != null;
    },
    GetPotentialContactsWith: function(otherNode, contacts, limit) {
        // Out if no contact or room to report contacts
        if(!this.Overlaps(otherNode) || limit == 0)
            return 0;

        // If these are both leaf nodes, then we have apotential contact to move to the midphase
        if(this.Isleaf() && otherNode.Isleaf()) {
            contacts.data[0] = this.data;
            contacts.data[1] = otherNode.data;
            return 1;
        }

        // Descend into whichever is not a leaf. If both are branches, go into the largest one
        var count = 0;
        if(otherNode.Isleaf() || (!this.Isleaf() && this.volume.GetSize() >= otherNode.volume.GetSize())) {
            // recurse into self
            count = this.children[0].GetPotentialContactsWith(otherNode, contacts, limit);
            // Check whether there are enough slots to do the other side too.
            if(limit > count) {
                return count + this.children[1].GetPotentialContactsWith(otherNode, contacts + count, limit - count);
            }
            else {
                return count;
            }
        }
        else {
            // recurse into other node
            count = this.GetPotentialContactsWith(otherNode.children[0], contacts, limit);
            // Check whether there are enough slots to do the other side too.
            if(limit > count) {
                return count + this.GetPotentialContactsWith(otherNode.children[1], contacts + count, limit - count);
            }
            else {
                return count;
            }
        }
    },
    GetPotentialContacts: function(contacts, limit) {
        // Early out if leaf node or if there's no room for contacts
        if(this.Isleaf() || limit == 0)
            return 0;

        return this.children[0].GetPotentialContactsWith(this.children[1], contacts, limit);
    },
    Overlaps: function(otherNode) {
        // Need to make an "Overlaps" method for the shape to be used here.
        return this.volume.Overlaps(otherNode.volume);
    },
    Insert: function(newVolume, newData) {
        // If this is a leaf, spawn two new children and place body in one
        if(this.Isleaf()) {
            // Child one is a copy of us
            this.children[0] = new SphereHierarchyNode(this.volume, this.data);
            this.children[0].parent = this;
            // Child two is the new one
            this.children[1] = new SphereHierarchyNode(newVolume, newData);
            this.children[1].parent = this;
            // Now no longer a leaf
            this.data = null;
            this.RecalculateBoundingVolume();
        }
        // Otherwise, insert into whichever side would grow the least to incorporate it.
        else {
            if(this.children[0].volume.GetGrowth(newVolume) < this.children[1].volume.GetGrowth(newVolume))
                this.children[0].Insert(newVolume, newData);
            else
                this.children[1].Insert(newVolume, newData);
        }
    },
    Remove: function() {
        if(this.parent) {
            // Find sibling
            var sibling = (this.parent.children[0] == this) ? parent.children[1] : parent.children[0];
            // Write data to parent
            this.parent.volume = sibling.volume;
            this.parent.data = sibling.data;
            this.parent.children = sibling.children;
            // Get rid of sibling
            sibling = null;

            this.parent.RecalculateBoundingVolume();
        }
        if(this.children[0]) {
            this.children[0].parent = null;
            this.children[0] = null;
        }
        if(this.children[1]) {
            this.children[1].parent = null;
            this.children[1] = null;
        }
    }
};



/****************** QuadTree ****************/

function Quadtree(level, rect) {
    this.MAX_OBJS = 10;
    this.MAX_LEVELS = 5;

    this.level = level;
    this.objIndices = [];
    this.rect = rect;
    this.nodes = [];
}
Quadtree.prototype = {
    Clear: function() {
        this.objs = [];
        for(var i = 0; i < this.nodes.length; i++) {
            if(this.nodes[i] != null) {
                this.nodes[i].Clear();
                this.nodes[i] = null;
            }
        }
    },
    Split: function() {
        var x = this.rect.pos.x,
            z = this.rect.pos.y,
            subW = this.rect.radii.x / 2,
            subD = this.rect.radii.y / 2;

        this.nodes[0] = new Rect(x - subW, z - subD, subW, subD);
        this.nodes[1] = new Rect(x - subW, z + subD, subW, subD);
        this.nodes[2] = new Rect(x + subW, z + subD, subW, subD);
        this.nodes[3] = new Rect(x + subW, z - subD, subW, subD);
    },
    GetIndex: function(rect) {
        var index = -1;
        var centre = this.rect.pos;
    }
};