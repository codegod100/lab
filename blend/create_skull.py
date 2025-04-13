import bpy
import math
import bmesh

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create the base skull
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(0, 0, 0))
skull = bpy.context.active_object
skull.name = "Skull"

# Scale to make it more skull-like
skull.scale = (0.8, 1, 1.2)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Create eye sockets
def create_eye_socket(x_pos):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(x_pos, 0.5, 0.2))
    eye_socket = bpy.context.active_object
    eye_socket.name = f"Eye_Socket_{x_pos}"
    
    # Boolean operation to create the eye socket
    bool_mod = skull.modifiers.new(name=f"Eye_Socket_Bool_{x_pos}", type='BOOLEAN')
    bool_mod.operation = 'DIFFERENCE'
    bool_mod.object = eye_socket
    bpy.ops.object.modifier_apply({"object": skull}, modifier=bool_mod.name)
    
    # Delete the cutter object
    bpy.ops.object.select_all(action='DESELECT')
    eye_socket.select_set(True)
    bpy.ops.object.delete()

create_eye_socket(-0.3)
create_eye_socket(0.3)

# Create nasal cavity
bpy.ops.mesh.primitive_cube_add(size=0.3, location=(0, 0.6, -0.2))
nose = bpy.context.active_object
nose.scale = (0.3, 0.3, 0.5)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bool_mod = skull.modifiers.new(name="Nose_Bool", type='BOOLEAN')
bool_mod.operation = 'DIFFERENCE'
bool_mod.object = nose
bpy.ops.object.modifier_apply({"object": skull}, modifier=bool_mod.name)

# Delete the nose cutter object
bpy.ops.object.select_all(action='DESELECT')
nose.select_set(True)
bpy.ops.object.delete()

# Create jaw/mouth cavity
bpy.ops.mesh.primitive_cube_add(size=0.5, location=(0, 0.6, -0.6))
jaw = bpy.context.active_object
jaw.scale = (0.6, 0.4, 0.3)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bool_mod = skull.modifiers.new(name="Jaw_Bool", type='BOOLEAN')
bool_mod.operation = 'DIFFERENCE'
bool_mod.object = jaw
bpy.ops.object.modifier_apply({"object": skull}, modifier=bool_mod.name)

# Delete the jaw cutter object
bpy.ops.object.select_all(action='DESELECT')
jaw.select_set(True)
bpy.ops.object.delete()

# Add a subsurf modifier to smooth the skull
subsurf = skull.modifiers.new(name="Subsurf", type='SUBSURF')
subsurf.levels = 2
subsurf.render_levels = 3

# Add some teeth
def create_tooth(x_pos, z_pos):
    bpy.ops.mesh.primitive_cube_add(size=0.1, location=(x_pos, 0.75, z_pos))
    tooth = bpy.context.active_object
    tooth.name = f"Tooth_{x_pos}_{z_pos}"
    tooth.scale = (0.08, 0.08, 0.15)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    # Add a bevel modifier
    bevel = tooth.modifiers.new(name="Bevel", type='BEVEL')
    bevel.width = 0.02
    bevel.segments = 3
    
    # Add a subsurf modifier
    subsurf = tooth.modifiers.new(name="Subsurf", type='SUBSURF')
    subsurf.levels = 1
    
    return tooth

# Create upper teeth
teeth = []
for i in range(-3, 4):
    tooth = create_tooth(i * 0.1, -0.5)
    teeth.append(tooth)

# Select the skull
bpy.ops.object.select_all(action='DESELECT')
skull.select_set(True)
bpy.context.view_layer.objects.active = skull

# Create a material for the skull
mat = bpy.data.materials.new(name="Skull_Material")
mat.use_nodes = True
nodes = mat.node_tree.nodes
bsdf = nodes.get("Principled BSDF")
bsdf.inputs[0].default_value = (0.9, 0.9, 0.85, 1.0)  # Bone color
bsdf.inputs[7].default_value = 0.3  # Roughness
skull.data.materials.append(mat)

# Create a material for teeth
tooth_mat = bpy.data.materials.new(name="Tooth_Material")
tooth_mat.use_nodes = True
nodes = tooth_mat.node_tree.nodes
bsdf = nodes.get("Principled BSDF")
bsdf.inputs[0].default_value = (0.95, 0.95, 0.9, 1.0)  # Tooth color
bsdf.inputs[7].default_value = 0.2  # Roughness

# Apply tooth material to all teeth
for tooth in teeth:
    tooth.data.materials.append(tooth_mat)

# Set up lighting
bpy.ops.object.light_add(type='SUN', radius=1, location=(0, 0, 5))
sun = bpy.context.active_object
sun.data.energy = 3.0

# Set up camera
bpy.ops.object.camera_add(location=(0, -3, 0), rotation=(math.pi/2, 0, 0))
cam = bpy.context.active_object
bpy.context.scene.camera = cam

# Select the skull as the active object
bpy.ops.object.select_all(action='DESELECT')
skull.select_set(True)
bpy.context.view_layer.objects.active = skull

print("Skull creation complete!")